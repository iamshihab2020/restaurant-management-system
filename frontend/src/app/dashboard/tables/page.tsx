"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableStatus } from "@/types";
import {
  Users,
  MapPin,
  Clock,
  DollarSign,
  Utensils,
  CheckCircle,
  AlertCircle,
  Search,
  Grid3x3,
  List,
} from "lucide-react";
import { toast } from "sonner";
import { useTables, useUpdateTableStatus } from "@/lib/hooks/use-tables";
import { useTableCurrentOrder } from "@/lib/hooks/use-tables";

export default function TablesPage() {
  // React Query hooks
  const { data: tables = [], isLoading } = useTables();
  const updateTableStatusMutation = useUpdateTableStatus();

  // Local state
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [filterStatus, setFilterStatus] = useState<TableStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState<string | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Get current order for a table (using the hook)
  const getTableOrder = (tableId: string) => {
    const table = tables.find(t => t._id === tableId);
    return table?.currentOrder || null;
  };

  const getOrderTotal = (tableId: string) => {
    const order = getTableOrder(tableId);
    return order?.total || 0;
  };

  const getOrderDuration = (tableId: string) => {
    const order = getTableOrder(tableId);
    if (!order) return null;
    const duration = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000);
    return duration;
  };

  const filteredTables = tables.filter((table) => {
    const matchesStatus = filterStatus === "all" || table.status === filterStatus;
    const matchesArea = selectedArea === "all" || table.location?.toLowerCase() === selectedArea;
    const matchesSearch =
      searchQuery === "" ||
      table.tableNumber.toString().includes(searchQuery) ||
      table.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      table.reservedFor?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesArea && matchesSearch;
  });

  const statusCounts = {
    all: tables.length,
    available: tables.filter((t) => t.status === "available").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
    cleaning: tables.filter((t) => t.status === "cleaning").length,
  };

  const getStatusColor = (status: TableStatus) => {
    const colors = {
      available: "bg-green-500/10 text-green-600 border-green-500/20",
      occupied: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      reserved: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      cleaning: "bg-gray-500/10 text-gray-600 border-gray-500/20",
    };
    return colors[status];
  };

  const getStatusIcon = (status: TableStatus) => {
    const icons = {
      available: <CheckCircle className="w-4 h-4" />,
      occupied: <Users className="w-4 h-4" />,
      reserved: <Clock className="w-4 h-4" />,
      cleaning: <AlertCircle className="w-4 h-4" />,
    };
    return icons[status];
  };

  const handleStatusChange = async (tableId: string, newStatus: TableStatus) => {
    try {
      await updateTableStatusMutation.mutateAsync({ id: tableId, status: newStatus });
      const table = tables.find((t) => t._id === tableId);
      toast.success(`Table ${table?.tableNumber} is now ${newStatus}`);
      setSelectedTable(null);
    } catch (error) {
      console.error("Failed to update table status:", error);
      toast.error("Failed to update table status");
    }
  };

  const areas = ["all", "indoor", "outdoor", "vip"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Table Management</h1>
          <p className="text-muted-foreground mt-1">Visual table management and status overview</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3x3 className="w-4 h-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tables</p>
                <p className="text-3xl font-bold text-foreground">{statusCounts.all}</p>
              </div>
              <MapPin className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all border-green-500/20 bg-green-500/5 ${
            filterStatus === "available" ? "ring-2 ring-green-500" : ""
          }`}
          onClick={() => setFilterStatus(filterStatus === "available" ? "all" : "available")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Available</p>
                <p className="text-3xl font-bold text-green-600">{statusCounts.available}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all border-blue-500/20 bg-blue-500/5 ${
            filterStatus === "occupied" ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => setFilterStatus(filterStatus === "occupied" ? "all" : "occupied")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Occupied</p>
                <p className="text-3xl font-bold text-blue-600">{statusCounts.occupied}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all border-yellow-500/20 bg-yellow-500/5 ${
            filterStatus === "reserved" ? "ring-2 ring-yellow-500" : ""
          }`}
          onClick={() => setFilterStatus(filterStatus === "reserved" ? "all" : "reserved")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Reserved</p>
                <p className="text-3xl font-bold text-yellow-600">{statusCounts.reserved}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all border-gray-500/20 bg-gray-500/5 ${
            filterStatus === "cleaning" ? "ring-2 ring-gray-500" : ""
          }`}
          onClick={() => setFilterStatus(filterStatus === "cleaning" ? "all" : "cleaning")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cleaning</p>
                <p className="text-3xl font-bold text-gray-600">{statusCounts.cleaning}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          {areas.map((area) => (
            <Button
              key={area}
              variant={selectedArea === area ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedArea(area)}
              className="capitalize"
            >
              {area}
            </Button>
          ))}
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredTables.map((table) => {
            const order = getTableOrder(table._id);
            const duration = getOrderDuration(table._id);
            const total = getOrderTotal(table._id);

            return (
              <Card
                key={table._id}
                className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                  table.status === "available"
                    ? "border-green-500/20 hover:border-green-500"
                    : table.status === "occupied"
                    ? "border-blue-500/20 hover:border-blue-500"
                    : table.status === "reserved"
                    ? "border-yellow-500/20 hover:border-yellow-500"
                    : "border-gray-500/20 hover:border-gray-500"
                }`}
                onClick={() => setSelectedTable(table)}
              >
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl ${
                            table.status === "available"
                              ? "bg-green-500/10 text-green-600"
                              : table.status === "occupied"
                              ? "bg-blue-500/10 text-blue-600"
                              : table.status === "reserved"
                              ? "bg-yellow-500/10 text-yellow-600"
                              : "bg-gray-500/10 text-gray-600"
                          }`}
                        >
                          {table.tableNumber}
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Seats</p>
                          <p className="font-semibold">{table.capacity}</p>
                        </div>
                      </div>
                    </div>

                    <Badge className={`w-full justify-center ${getStatusColor(table.status)}`}>
                      {getStatusIcon(table.status)}
                      <span className="ml-1 capitalize">{table.status}</span>
                    </Badge>

                    {table.location && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 mr-1" />
                        {table.location}
                      </div>
                    )}

                    {order && (
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Order:</span>
                          <span className="font-semibold">{order.orderNumber}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-bold text-primary">${total.toFixed(2)}</span>
                        </div>
                        {duration !== null && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="font-medium">{duration} min</span>
                          </div>
                        )}
                        <Badge variant="outline" className="w-full justify-center text-xs">
                          {order.status.replace("_", " ")}
                        </Badge>
                      </div>
                    )}

                    {table.reservedFor && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">Reserved for:</p>
                        <p className="text-sm font-semibold">{table.reservedFor}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {filteredTables.map((table) => {
                const order = getTableOrder(table._id);
                const duration = getOrderDuration(table._id);
                const total = getOrderTotal(table._id);

                return (
                  <div
                    key={table._id}
                    className="flex items-center justify-between p-4 rounded-lg border-2 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedTable(table)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-lg flex items-center justify-center font-bold text-2xl ${
                          table.status === "available"
                            ? "bg-green-500/10 text-green-600"
                            : table.status === "occupied"
                            ? "bg-blue-500/10 text-blue-600"
                            : table.status === "reserved"
                            ? "bg-yellow-500/10 text-yellow-600"
                            : "bg-gray-500/10 text-gray-600"
                        }`}
                      >
                        {table.tableNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getStatusColor(table.status)}>
                            {getStatusIcon(table.status)}
                            <span className="ml-1 capitalize">{table.status}</span>
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {table.capacity} seats
                          </span>
                          {table.location && (
                            <span className="text-sm text-muted-foreground">
                              • {table.location}
                            </span>
                          )}
                        </div>
                        {order && (
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-muted-foreground">{order.orderNumber}</span>
                            <span className="font-bold text-primary">${total.toFixed(2)}</span>
                            {duration !== null && (
                              <span className="text-muted-foreground">{duration} min</span>
                            )}
                          </div>
                        )}
                        {table.reservedFor && (
                          <p className="text-sm text-muted-foreground">
                            Reserved: {table.reservedFor}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredTables.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold text-foreground mb-2">No tables found</p>
              <p className="text-muted-foreground">
                {searchQuery
                  ? `No tables match "${searchQuery}"`
                  : `No ${filterStatus !== "all" ? filterStatus : ""} tables available`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!selectedTable} onOpenChange={() => setSelectedTable(null)}>
        <DialogContent className="max-w-2xl">
          {selectedTable && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div
                    className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-3xl ${
                      selectedTable.status === "available"
                        ? "bg-green-500/10 text-green-600"
                        : selectedTable.status === "occupied"
                        ? "bg-blue-500/10 text-blue-600"
                        : selectedTable.status === "reserved"
                        ? "bg-yellow-500/10 text-yellow-600"
                        : "bg-gray-500/10 text-gray-600"
                    }`}
                  >
                    {selectedTable.tableNumber}
                  </div>
                  <div>
                    <p>Table {selectedTable.tableNumber}</p>
                    <Badge className={`mt-1 ${getStatusColor(selectedTable.status)}`}>
                      {getStatusIcon(selectedTable.status)}
                      <span className="ml-1 capitalize">{selectedTable.status}</span>
                    </Badge>
                  </div>
                </DialogTitle>
                <DialogDescription>
                  Manage table status and view current order details
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Capacity</p>
                      <p className="text-2xl font-bold flex items-center">
                        <Users className="w-5 h-5 mr-1" />
                        {selectedTable.capacity}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="text-lg font-semibold capitalize">{selectedTable.location || "Main"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-lg font-semibold capitalize">{selectedTable.status}</p>
                    </CardContent>
                  </Card>
                </div>

                {getTableOrder(selectedTable._id) && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-lg">Current Order</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order Number:</span>
                        <span className="font-semibold">{getTableOrder(selectedTable._id)?.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Items:</span>
                        <span className="font-semibold">{getTableOrder(selectedTable._id)?.items.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-bold text-primary text-xl">
                          ${getOrderTotal(selectedTable._id).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-semibold">{getOrderDuration(selectedTable._id)} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Order Status:</span>
                        <Badge variant="outline" className="capitalize">
                          {getTableOrder(selectedTable._id)?.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-3">
                  <h3 className="font-semibold">Change Table Status</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={selectedTable.status === "available" ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => handleStatusChange(selectedTable._id, "available")}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Available
                    </Button>
                    <Button
                      variant={selectedTable.status === "occupied" ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => handleStatusChange(selectedTable._id, "occupied")}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Occupied
                    </Button>
                    <Button
                      variant={selectedTable.status === "reserved" ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => handleStatusChange(selectedTable._id, "reserved")}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Reserved
                    </Button>
                    <Button
                      variant={selectedTable.status === "cleaning" ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => handleStatusChange(selectedTable._id, "cleaning")}
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Cleaning
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedTable(null)}>
                  Close
                </Button>
                {getTableOrder(selectedTable._id) && (
                  <Button>
                    <Utensils className="w-4 h-4 mr-2" />
                    View Order
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
