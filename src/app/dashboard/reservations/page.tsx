"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Reservation, ReservationStatus, CreateReservationInput, Table } from "@/types";
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Volume2,
  VolumeX,
  ArrowUpDown,
  Filter,
  UtensilsCrossed,
  CalendarCheck,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  fetchReservations,
  createReservation,
  updateReservationStatus,
  updateReservation,
  deleteReservation,
} from "@/services/reservation-service";
import { fetchAvailableTables } from "@/services/table-service";
import {
  playNewOrderSound,
  toggleSounds,
  areSoundsEnabled,
} from "@/lib/notification-sounds";

/**
 * Reservations Page
 * Complete reservation management with CRUD operations, status tracking, and advanced filtering
 */

type SortOption = "date-asc" | "date-desc" | "time-asc" | "time-desc" | "party-size" | "name";
type StatusFilter = "all" | "pending" | "confirmed" | "seated" | "cancelled" | "no_show";

/**
 * Status Configuration with distinct colors and icons
 */
const getStatusConfig = (status: ReservationStatus) => {
  const configs = {
    pending: {
      color: "bg-slate-500 text-white",
      icon: Clock,
      label: "Pending",
    },
    confirmed: {
      color: "bg-blue-500 text-white",
      icon: CheckCircle,
      label: "Confirmed",
    },
    seated: {
      color: "bg-primary text-white",
      icon: UtensilsCrossed,
      label: "Seated",
    },
    cancelled: {
      color: "bg-destructive text-white",
      icon: XCircle,
      label: "Cancelled",
    },
    no_show: {
      color: "bg-orange-500 text-white",
      icon: AlertTriangle,
      label: "No Show",
    },
  };
  return configs[status] || configs.pending;
};

export default function ReservationsPage() {
  // State Management
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [availableTables, setAvailableTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(areSoundsEnabled());

  // Filter and Sort State
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date-asc");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Modal State
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Create Form State
  const [createForm, setCreateForm] = useState<CreateReservationInput>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    partySize: 2,
    reservationDate: new Date(),
    reservationTime: "19:00",
    tableId: undefined,
    specialRequests: "",
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "n":
          setIsCreateDialogOpen(true);
          break;
        case "m":
          handleSoundToggle();
          break;
        case "/":
          e.preventDefault();
          document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
          break;
        case "a":
          setStatusFilter("all");
          break;
        case "p":
          setStatusFilter("pending");
          break;
        case "c":
          setStatusFilter("confirmed");
          break;
        case "s":
          setStatusFilter("seated");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [soundEnabled]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [reservationsData, tablesData] = await Promise.all([
        fetchReservations(),
        fetchAvailableTables(),
      ]);
      setReservations(reservationsData);
      setAvailableTables(tablesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load reservations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSoundToggle = () => {
    const newState = toggleSounds();
    setSoundEnabled(newState);
    toast.success(`Sound ${newState ? "enabled" : "disabled"}`);
  };

  // Filter and sort reservations
  const filteredReservations = reservations
    .filter((res) => {
      // Status filter
      if (statusFilter !== "all" && res.status !== statusFilter) return false;

      // Date filter
      if (selectedDate) {
        const resDate = new Date(res.reservationDate);
        resDate.setHours(0, 0, 0, 0);
        const filterDate = new Date(selectedDate);
        filterDate.setHours(0, 0, 0, 0);
        if (resDate.getTime() !== filterDate.getTime()) return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          res.customerName.toLowerCase().includes(query) ||
          res.customerPhone.includes(searchQuery)
        );
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.reservationDate).getTime() - new Date(b.reservationDate).getTime();
        case "date-desc":
          return new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime();
        case "time-asc":
          return a.reservationTime.localeCompare(b.reservationTime);
        case "time-desc":
          return b.reservationTime.localeCompare(a.reservationTime);
        case "party-size":
          return b.partySize - a.partySize;
        case "name":
          return a.customerName.localeCompare(b.customerName);
        default:
          return 0;
      }
    });

  // Calculate statistics
  const todaysReservations = reservations.filter((r) => {
    const today = new Date();
    const resDate = new Date(r.reservationDate);
    return (
      resDate.getDate() === today.getDate() &&
      resDate.getMonth() === today.getMonth() &&
      resDate.getFullYear() === today.getFullYear()
    );
  });

  const statusCounts = {
    pending: reservations.filter((r) => r.status === "pending").length,
    confirmed: reservations.filter((r) => r.status === "confirmed").length,
    seated: reservations.filter((r) => r.status === "seated").length,
  };

  // Calculate urgency for upcoming reservations
  const getUrgency = (reservation: Reservation): "none" | "soon" | "overdue" => {
    if (reservation.status !== "confirmed") return "none";

    const resDate = new Date(reservation.reservationDate);
    const [hours, minutes] = reservation.reservationTime.split(":").map(Number);
    resDate.setHours(hours, minutes, 0, 0);

    const diff = resDate.getTime() - currentTime.getTime();
    const minutesUntil = Math.floor(diff / 60000);

    if (minutesUntil < 0) return "overdue"; // Past reservation time
    if (minutesUntil <= 15) return "soon"; // Arriving in next 15 minutes
    return "none";
  };

  // CRUD Operations
  const handleCreateReservation = async () => {
    try {
      // Validation
      if (!createForm.customerName || !createForm.customerPhone) {
        toast.error("Please fill in required fields");
        return;
      }

      const newReservation = await createReservation(createForm, "current-user-id");
      setReservations([...reservations, newReservation]);

      playNewOrderSound();
      toast.success("Reservation created successfully");

      setIsCreateDialogOpen(false);
      resetCreateForm();
    } catch (error) {
      console.error("Error creating reservation:", error);
      toast.error("Failed to create reservation");
    }
  };

  const handleUpdateStatus = async (reservationId: string, newStatus: ReservationStatus) => {
    try {
      const updated = await updateReservationStatus(reservationId, newStatus);
      setReservations(
        reservations.map((r) => (r.id === reservationId ? updated : r))
      );

      toast.success(`Reservation ${newStatus.replace("_", " ")}`);
      setIsDetailDialogOpen(false);
      setSelectedReservation(null);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update reservation");
    }
  };

  const handleAssignTable = async (reservationId: string, tableId: string) => {
    try {
      const updated = await updateReservation(reservationId, { tableId });
      setReservations(
        reservations.map((r) => (r.id === reservationId ? updated : r))
      );

      toast.success("Table assigned successfully");
    } catch (error) {
      console.error("Error assigning table:", error);
      toast.error("Failed to assign table");
    }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;

    try {
      await deleteReservation(reservationId);
      setReservations(reservations.filter((r) => r.id !== reservationId));

      toast.success("Reservation cancelled");
      setIsDetailDialogOpen(false);
      setSelectedReservation(null);
    } catch (error) {
      console.error("Error deleting reservation:", error);
      toast.error("Failed to cancel reservation");
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      partySize: 2,
      reservationDate: new Date(),
      reservationTime: "19:00",
      tableId: undefined,
      specialRequests: "",
    });
  };

  const openDetailDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header with Live Clock */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reservations</h1>
          <p className="text-muted-foreground mt-1">Manage customer reservations</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSoundToggle}
            className="gap-2"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-4 w-4" />
                Sound On
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4" />
                Sound Off
              </>
            )}
            <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium">
              M
            </kbd>
          </Button>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground font-mono">
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <Button size="lg" onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="w-5 h-5" />
            New Reservation
            <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-white/30 bg-white/20 text-white px-1.5 font-mono text-[10px] font-medium">
              N
            </kbd>
          </Button>
        </div>
      </div>

      {/* Statistics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Reservations</p>
                <p className="text-2xl font-bold text-primary">{todaysReservations.length}</p>
              </div>
              <CalendarCheck className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-slate-500">{statusCounts.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-blue-500">{statusCounts.confirmed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Currently Seated</p>
                <p className="text-2xl font-bold text-primary">{statusCounts.seated}</p>
              </div>
              <UtensilsCrossed className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap items-center gap-4 bg-card p-4 rounded-lg border">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <FormInput
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Status:</span>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="seated">Seated</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no_show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[180px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                {selectedDate ? format(selectedDate, "PPP") : "Filter by date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
              {selectedDate && (
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedDate(undefined)}
                  >
                    Clear Date Filter
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Sort:</span>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-asc">Date (Earliest)</SelectItem>
              <SelectItem value="date-desc">Date (Latest)</SelectItem>
              <SelectItem value="time-asc">Time (Earliest)</SelectItem>
              <SelectItem value="time-desc">Time (Latest)</SelectItem>
              <SelectItem value="party-size">Party Size</SelectItem>
              <SelectItem value="name">Customer Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium">Shortcuts:</span>
            <kbd className="px-1.5 py-0.5 bg-muted border rounded">N</kbd>
            <span>New</span>
            <span className="text-border">|</span>
            <kbd className="px-1.5 py-0.5 bg-muted border rounded">/</kbd>
            <span>Search</span>
            <span className="text-border">|</span>
            <kbd className="px-1.5 py-0.5 bg-muted border rounded">M</kbd>
            <span>Sound</span>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            {filteredReservations.length} reservation{filteredReservations.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Reservations Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-1/4 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : filteredReservations.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Reservations Found
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" || selectedDate
                ? "Try adjusting your filters"
                : "Create your first reservation to get started"}
            </p>
            {(searchQuery || statusFilter !== "all" || selectedDate) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setSelectedDate(undefined);
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReservations.map((reservation) => {
            const config = getStatusConfig(reservation.status);
            const urgency = getUrgency(reservation);
            const StatusIcon = config.icon;

            return (
              <Card
                key={reservation.id}
                className={cn(
                  "hover:shadow-lg transition-all cursor-pointer",
                  urgency === "soon" && "border-amber-500 border-2 bg-amber-500/5",
                  urgency === "overdue" && "border-orange-500 border-2 bg-orange-500/5"
                )}
                onClick={() => openDetailDialog(reservation)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        {reservation.customerName}
                        {urgency === "soon" && (
                          <span className="text-xs font-normal text-amber-600 dark:text-amber-500">
                            (Arriving soon)
                          </span>
                        )}
                        {urgency === "overdue" && (
                          <span className="text-xs font-normal text-orange-600 dark:text-orange-500">
                            (Overdue check-in)
                          </span>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {reservation.partySize} {reservation.partySize === 1 ? "guest" : "guests"}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                        config.color
                      )}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {config.label}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(new Date(reservation.reservationDate), "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      {reservation.reservationTime}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2" />
                      {reservation.customerPhone}
                    </div>
                    {reservation.customerEmail && (
                      <div className="flex items-center text-muted-foreground truncate">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{reservation.customerEmail}</span>
                      </div>
                    )}
                  </div>

                  {reservation.table && (
                    <div className="flex items-center gap-2 text-sm bg-primary/10 text-primary px-3 py-2 rounded-md">
                      <UtensilsCrossed className="w-4 h-4" />
                      <span className="font-medium">
                        Table {reservation.table.tableNumber}
                      </span>
                      {reservation.table.location && (
                        <span className="text-xs">({reservation.table.location})</span>
                      )}
                    </div>
                  )}

                  {reservation.specialRequests && (
                    <div className="bg-muted/50 p-2 rounded text-sm italic text-foreground">
                      <span className="font-medium not-italic">Special Request:</span>{" "}
                      {reservation.specialRequests}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Reservation Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Reservation</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new reservation
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Customer Name <span className="text-destructive">*</span>
                </label>
                <FormInput
                  value={createForm.customerName}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, customerName: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Phone Number <span className="text-destructive">*</span>
                </label>
                <FormInput
                  value={createForm.customerPhone}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, customerPhone: e.target.value })
                  }
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email (Optional)</label>
              <FormInput
                type="email"
                value={createForm.customerEmail}
                onChange={(e) =>
                  setCreateForm({ ...createForm, customerEmail: e.target.value })
                }
                placeholder="john@example.com"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Party Size</label>
                <Select
                  value={createForm.partySize.toString()}
                  onValueChange={(value) =>
                    setCreateForm({ ...createForm, partySize: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "guest" : "guests"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(createForm.reservationDate, "MMM d, yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={createForm.reservationDate}
                      onSelect={(date) =>
                        date && setCreateForm({ ...createForm, reservationDate: date })
                      }
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Select
                  value={createForm.reservationTime}
                  onValueChange={(value) =>
                    setCreateForm({ ...createForm, reservationTime: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => {
                      const hour = Math.floor(11 + i * 0.5);
                      const minute = i % 2 === 0 ? "00" : "30";
                      const time = `${hour.toString().padStart(2, "0")}:${minute}`;
                      return (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Assign Table (Optional)</label>
              <Select
                value={createForm.tableId}
                onValueChange={(value) =>
                  setCreateForm({ ...createForm, tableId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="No table assigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No table assigned</SelectItem>
                  {availableTables.map((table) => (
                    <SelectItem key={table.id} value={table.id}>
                      Table {table.tableNumber} - {table.capacity} seats
                      {table.location && ` (${table.location})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Special Requests (Optional)</label>
              <textarea
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={createForm.specialRequests}
                onChange={(e) =>
                  setCreateForm({ ...createForm, specialRequests: e.target.value })
                }
                placeholder="Any special requests or notes..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateReservation}>Create Reservation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail/Edit Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedReservation && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Reservation Details</span>
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                      getStatusConfig(selectedReservation.status).color
                    )}
                  >
                    {React.createElement(getStatusConfig(selectedReservation.status).icon, {
                      className: "w-3 h-3",
                    })}
                    {getStatusConfig(selectedReservation.status).label}
                  </div>
                </DialogTitle>
                <DialogDescription>
                  View and manage reservation details
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Customer Name
                    </label>
                    <p className="text-foreground font-medium">
                      {selectedReservation.customerName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Party Size
                    </label>
                    <p className="text-foreground font-medium">
                      {selectedReservation.partySize} guests
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date</label>
                    <p className="text-foreground font-medium">
                      {format(new Date(selectedReservation.reservationDate), "MMMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Time</label>
                    <p className="text-foreground font-medium">
                      {selectedReservation.reservationTime}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="text-foreground font-medium">
                      {selectedReservation.customerPhone}
                    </p>
                  </div>
                  {selectedReservation.customerEmail && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-foreground font-medium">
                        {selectedReservation.customerEmail}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Assigned Table
                  </label>
                  <Select
                    value={selectedReservation.tableId || "none"}
                    onValueChange={(value) =>
                      value !== "none" &&
                      handleAssignTable(selectedReservation.id, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No table assigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No table assigned</SelectItem>
                      {availableTables.map((table) => (
                        <SelectItem key={table.id} value={table.id}>
                          Table {table.tableNumber} - {table.capacity} seats
                          {table.location && ` (${table.location})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedReservation.specialRequests && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Special Requests
                    </label>
                    <div className="bg-muted/50 p-3 rounded mt-1 text-sm">
                      {selectedReservation.specialRequests}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="flex-1 sm:flex-none"
                >
                  Close
                </Button>

                {selectedReservation.status === "pending" && (
                  <Button
                    onClick={() =>
                      handleUpdateStatus(selectedReservation.id, "confirmed")
                    }
                    className="flex-1 sm:flex-none"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm
                  </Button>
                )}

                {selectedReservation.status === "confirmed" && (
                  <Button
                    onClick={() =>
                      handleUpdateStatus(selectedReservation.id, "seated")
                    }
                    className="flex-1 sm:flex-none"
                  >
                    <UtensilsCrossed className="w-4 h-4 mr-2" />
                    Mark Seated
                  </Button>
                )}

                {selectedReservation.status === "confirmed" && (
                  <Button
                    variant="destructive"
                    onClick={() =>
                      handleUpdateStatus(selectedReservation.id, "no_show")
                    }
                    className="flex-1 sm:flex-none"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    No Show
                  </Button>
                )}

                {(selectedReservation.status === "pending" ||
                  selectedReservation.status === "confirmed") && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteReservation(selectedReservation.id)}
                    className="flex-1 sm:flex-none"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Reservation
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
