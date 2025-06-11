import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { StrategyCard } from "@/components/strategy-card";
import { CreateStrategyModal } from "@/components/create-strategy-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Strategy } from "@shared/schema";

export default function Strategies() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: strategies, isLoading } = useQuery<Strategy[]>({
    queryKey: ["/api/strategies/1"],
  });

  const createStrategyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/strategies", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/strategies/1"] });
      toast({
        title: "Success",
        description: "Strategy created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStrategyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/strategies/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/strategies/1"] });
      toast({
        title: "Success",
        description: "Strategy updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteStrategyMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/strategies/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/strategies/1"] });
      toast({
        title: "Success",
        description: "Strategy deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateStrategy = (data: any) => {
    createStrategyMutation.mutate(data);
  };

  const handleEditStrategy = (strategy: Strategy) => {
    // For now, just open the modal. In a full implementation, 
    // you'd pre-populate the form with the strategy data
    console.log("Edit strategy:", strategy);
  };

  const handleDeleteStrategy = (id: number) => {
    if (confirm("Are you sure you want to delete this strategy?")) {
      deleteStrategyMutation.mutate(id);
    }
  };

  const handleToggleStrategy = (id: number, isActive: boolean) => {
    updateStrategyMutation.mutate({
      id,
      data: { isActive }
    });
  };

  return (
    <div className="pb-16 md:pb-0 md:ml-64">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Trading Strategies</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your automated trading strategies</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Strategy
          </Button>
        </div>
      </header>

      <div className="p-4 md:p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
                <div className="h-4 bg-muted rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : strategies && strategies.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {strategies.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                onEdit={handleEditStrategy}
                onDelete={handleDeleteStrategy}
                onToggle={handleToggleStrategy}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-card rounded-xl border border-border p-8">
              <h3 className="text-lg font-semibold mb-2">No strategies yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first automated trading strategy to get started.
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Strategy
              </Button>
            </div>
          </div>
        )}
      </div>

      <CreateStrategyModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleCreateStrategy}
      />
    </div>
  );
}
