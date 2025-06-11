import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStrategySchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const createStrategyFormSchema = insertStrategySchema.extend({
  name: z.string().min(1, "Strategy name is required"),
  symbol: z.string().min(1, "Trading pair is required"),
  buyPrice: z.string().min(1, "Buy price is required"),
  buyAmount: z.string().min(1, "Buy amount is required"),
  sellPrice: z.string().min(1, "Sell price is required"),
  sellAmount: z.string().min(1, "Sell amount is required"),
});

type CreateStrategyFormData = z.infer<typeof createStrategyFormSchema>;

interface CreateStrategyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateStrategyFormData) => void;
}

const tradingPairs = [
  { value: "BTCUSDT", label: "BTC/USDT" },
  { value: "ETHUSDT", label: "ETH/USDT" },
  { value: "BNBUSDT", label: "BNB/USDT" },
  { value: "ADAUSDT", label: "ADA/USDT" },
  { value: "SOLUSDT", label: "SOL/USDT" },
  { value: "DOTUSDT", label: "DOT/USDT" },
];

export function CreateStrategyModal({ open, onOpenChange, onSubmit }: CreateStrategyModalProps) {
  const form = useForm<CreateStrategyFormData>({
    resolver: zodResolver(createStrategyFormSchema),
    defaultValues: {
      name: "",
      symbol: "",
      buyPrice: "",
      buyAmount: "",
      sellPrice: "",
      sellAmount: "",
      userId: 1, // Default user ID
      isActive: false,
      pnl: "0",
    },
  });

  const handleSubmit = (data: CreateStrategyFormData) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Strategy</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strategy Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., BTC DCA Strategy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trading Pair</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select trading pair" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tradingPairs.map((pair) => (
                        <SelectItem key={pair.value} value={pair.value}>
                          {pair.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="buyPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buy Price (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="42000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buyAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buy Amount (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sellPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sell Price (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="45000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sellAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sell Amount (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button 
                type="button" 
                variant="secondary" 
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Strategy
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
