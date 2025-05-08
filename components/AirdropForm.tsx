"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import {
  useChainId,
  useConfig,
  useAccount,
  useWriteContract,
  useReadContracts,
} from "wagmi";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { type ReadContractParameters } from "@wagmi/core";

type TransactionDetail = {
  recipient: string;
  amountWei: string;
  amountTokens: string;
};

export default function AirDropForm() {
  const [tokenAddress, setTokenAddress] = useState(
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
  );
  const [recipientsInput, setRecipientsInput] = useState("");
  const [amountsInput, setAmountsInput] = useState("");
  const [details, setDetails] = useState<TransactionDetail[]>([]);
  const [totalTokenAmount, setTotalTokenAmount] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const chainId = useChainId();
  const config = useConfig();
  const account = useAccount();
  const { data: hash, isPending, writeContractAsync } = useWriteContract();

  const { data: tokenData } = useReadContracts({
    contracts: [
      {
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "decimals",
      },
      {
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "name",
      },
      {
        abi: erc20Abi,
        address: tokenAddress as `0x${string}`,
        functionName: "balanceOf",
        args: [account.address],
      },
    ],
  });
  const [hasEnoughTokens, setHasEnoughTokens] = useState(true);

  // Token name and balance from tokenData
  const tokenName = (tokenData?.[1]?.result as string) || "Token";
  const tokenDecimals = Number(tokenData?.[0]?.result) || 18;
  const tokenBalance = useMemo(
    () => (tokenData?.[2]?.result as bigint) || BigInt(0),
    [tokenData]
  );
  const formattedBalance = useMemo(
    () => Number(tokenBalance) / Math.pow(10, tokenDecimals),
    [tokenData]
  );

  // Calculate and display token amounts on input change
  useEffect(() => {
    const result = parseAndValidateInputs();
    if (result) {
      const { totalAmount } = result;
      const totalTokens = Number(totalAmount) / Math.pow(10, tokenDecimals);
      setTotalTokenAmount(totalTokens.toString());

      // Check if user has enough tokens
      const userHasEnough = BigInt(totalAmount) <= tokenBalance;
      setHasEnoughTokens(userHasEnough);
    }
  }, [amountsInput, tokenData, tokenBalance, tokenDecimals]);

  async function getApprovedAmount(
    tSenderAddress: string | null
  ): Promise<number> {
    if (!tSenderAddress) {
      alert("This chain only has the safer version!");
      return 0;
    }
    const response = await readContract(config, {
      abi: erc20Abi,
      address: tokenAddress as `0x${string}`,
      functionName: "allowance",
      args: [account.address, tSenderAddress as `0x${string}`],
    });
    return response as number;
  }

  const handleSubmit = async () => {
    if (!hasEnoughTokens) {
      alert(
        `Insufficient ${tokenName} balance. Please add more tokens or reduce amounts.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Approve tsender contract to send token
      const tSenderAddress = await chainsToTSender[chainId]["tsender"];
      console.log("tSenderAddress", tSenderAddress);

      const approvedAmount = await getApprovedAmount(tSenderAddress);
      console.log("approvedAmount", approvedAmount);

      const result = parseAndValidateInputs();
      console.log("result", result);

      if (!result) {
        setIsSubmitting(false);
        return;
      }

      const { recipients, amounts, totalAmount } = result;
      if (approvedAmount < totalAmount) {
        const approvalHash = await writeContractAsync({
          abi: erc20Abi,
          address: tokenAddress as `0x${string}`,
          functionName: "approve",
          args: [tSenderAddress as `0x${string}`, BigInt(totalAmount)],
        });

        const approvalReceipt = await waitForTransactionReceipt(config, {
          hash: approvalHash,
        });
        console.log("approval confirmed", approvalReceipt);
      }

      await writeContractAsync({
        abi: tsenderAbi,
        address: tSenderAddress as `0x${string}`,
        functionName: "airdropERC20",
        args: [tokenAddress, recipients, amounts, BigInt(totalAmount)],
      });
      formatTransactionDetails(recipients, amounts);
    } catch (error) {
      console.error("Error in airdrop transaction:", error);
      alert(
        "Failed to execute airdrop. Please check your inputs and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const parseAndValidateInputs = () => {
    const recipients = recipientsInput
      .split(/[\n,]+/)
      .map((r) => r.trim())
      .filter((r) => r);

    const amounts = amountsInput
      .split(/[\n,]+/)
      .map((a) => a.trim().match(/\d*\.?\d+/)?.[0]) // extract first number (including decimal)
      .filter((a) => a !== undefined)
      .map((a) => a);

    if (recipients.length !== amounts.length) {
      return null;
    }

    const totalAmount = amounts.reduce(
      (sum, amount) => sum + Number(amount),
      0
    );

    return { recipients, amounts, totalAmount };
  };

  const formatTransactionDetails = (
    recipients: string[],
    amounts: string[]
  ) => {
    const formatted = recipients.map((recipient, idx) => {
      const amountWei = amounts[idx];
      const amountTokens = (
        parseFloat(amountWei) / Math.pow(10, tokenDecimals)
      ).toString();
      return {
        recipient,
        amountWei,
        amountTokens,
      };
    });

    setDetails(formatted);
  };

  // Helper function to convert wei amounts to tokens for display
  const displayEquivalentTokens = () => {
    if (!amountsInput.trim()) return null;

    const amounts = amountsInput
      .split(/[\n,]+/)
      .map((a) => a.trim().match(/\d*\.?\d+/)?.[0])
      .filter((a) => a !== undefined)
      .map((a) => Number(a) / Math.pow(10, tokenDecimals));

    if (amounts.length === 0) return null;

    return (
      <div className="text-sm text-gray-500 mt-1">
        Equivalent in {tokenName}: {amounts.map((a) => a.toString()).join(", ")}
      </div>
    );
  };

  return (
    <Card className="max-w-2xl mx-auto mt-10 p-6">
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="tokenAddress">Token Address</Label>
          <Input
            id="tokenAddress"
            type="text"
            placeholder="0x1234...abcd"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
          />
          {(tokenData?.[1]?.result as string) && (
            <div className="flex justify-between mt-1">
              <Badge variant="outline" className="text-xs">
                {tokenName}
              </Badge>
              <span className="text-xs text-gray-500">
                Balance: {formattedBalance.toLocaleString()} {tokenName}
              </span>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="recipients">Recipients (comma or newline)</Label>
          <Textarea
            id="recipients"
            placeholder="0xabc...\n0xdef..., ..."
            value={recipientsInput}
            onChange={(e) => setRecipientsInput(e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="amounts">Amounts in wei (comma or newline)</Label>
          <Textarea
            id="amounts"
            placeholder="1000000000000000000\n2000000000000000000"
            value={amountsInput}
            onChange={(e) => setAmountsInput(e.target.value)}
            rows={4}
          />
          {displayEquivalentTokens()}
          {totalTokenAmount !== "0" && (
            <div className="flex justify-between mt-2">
              <span className="text-sm">
                Total: {totalTokenAmount} {tokenName}
              </span>
              {!hasEnoughTokens && (
                <span className="text-sm text-red-500">
                  Insufficient balance
                </span>
              )}
            </div>
          )}
        </div>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !hasEnoughTokens || isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting || isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Submit Transaction"
          )}
        </Button>

        {details.length > 0 && (
          <div className="space-y-2 mt-4">
            <h3 className="font-semibold text-lg">Transaction Details</h3>
            {details.map((detail, index) => (
              <div key={index} className="text-sm border p-2 rounded-md">
                <p>
                  <strong>Recipient:</strong> {detail.recipient}
                </p>
                <p>
                  <strong>Amount (wei):</strong> {detail.amountWei}
                </p>
                <p>
                  <strong>Amount ({tokenName}):</strong> {detail.amountTokens}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
