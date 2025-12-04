import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, TrendingUp, Users, DollarSign, Loader2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { salesApi, EventSalesSummaryDTO } from "@/api/sales.api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatVND } from "@/utils/currency";

const EventSales = () => {
  const { id } = useParams();
  const [salesData, setSalesData] = useState<EventSalesSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      if (!id) {
        setError("Event ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // This calls the backend which uses stored procedures:
        // - sp_GetEventSalesSummary
        // - sp_GetEventDailySales
        // - sp_GetEventRecentOrders
        // - fn_CalculateEventRevenue (function)
        const data = await salesApi.getEventSalesSummary(parseInt(id));
        setSalesData(data);
      } catch (err: any) {
        console.error('Failed to fetch sales data:', err);
        setError(err.response?.data?.message || 'Failed to load sales data. Make sure you are logged in as an organizer.');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
          <h2 className="text-2xl font-bold mb-2">Loading Sales Data...</h2>
          <p className="text-muted-foreground">Fetching data from stored procedures</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !salesData) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <Alert variant="destructive" className="max-w-lg mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Sales Data</AlertTitle>
            <AlertDescription>{error || "Event not found"}</AlertDescription>
          </Alert>
          <div className="text-center mt-6">
            <Button asChild>
              <Link to="/organize">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const capacityPercentage = salesData.totalCapacity > 0 
    ? (salesData.totalTicketsSold / salesData.totalCapacity) * 100 
    : 0;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6 gap-2" asChild>
          <Link to="/organize">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Info Badge - Shows this uses stored procedures */}
        <Alert className="mb-6 bg-primary/10 border-primary/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Functions & Stored Procedures</AlertTitle>
          <AlertDescription>
            This page demonstrates calling SQL Server stored procedures (sp_GetEventSalesSummary, sp_GetEventDailySales, sp_GetEventRecentOrders) 
            and functions (fn_CalculateEventRevenue) from the application.
          </AlertDescription>
        </Alert>

        {/* Event Header */}
        <div className="glass glass-border rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{salesData.eventTitle}</h1>
              <p className="text-muted-foreground">
                Event ID: {salesData.eventId}
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Sales Overview - Data from fn_CalculateEventRevenue */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass glass-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-cta/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-cta" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-cta">
                  ${salesData.totalRevenue?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  via fn_CalculateEventRevenue
                </p>
              </div>
            </div>
          </div>

          <div className="glass glass-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tickets Sold</p>
                <p className="text-3xl font-bold">
                  {salesData.totalTicketsSold?.toLocaleString() || '0'}
                  <span className="text-lg text-muted-foreground">
                    /{salesData.totalCapacity?.toLocaleString() || '0'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="glass glass-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Capacity</p>
                <p className="text-3xl font-bold">
                  {capacityPercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Categories - Data from sp_GetEventSalesSummary */}
        <div className="glass glass-border rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">Ticket Categories</h2>
          <p className="text-sm text-muted-foreground mb-6">Data from sp_GetEventSalesSummary stored procedure</p>
          
          {salesData.categoryBreakdown && salesData.categoryBreakdown.length > 0 ? (
            <div className="space-y-6">
              {salesData.categoryBreakdown.map((category, index) => {
                const percentage = category.totalCapacity > 0 
                  ? (category.ticketsSold / category.totalCapacity) * 100 
                  : 0;
                return (
                  <div key={index} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-lg">{category.categoryName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category.ticketsSold} of {category.totalCapacity} sold • {category.checkedInCount} checked in
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-cta">
                          {formatVND(category.revenue || 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {percentage.toFixed(1)}% sold
                      </p>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No ticket categories found</p>
          )}
        </div>

        {/* Daily Sales Chart - Data from sp_GetEventDailySales */}
        <div className="glass glass-border rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">Daily Sales</h2>
          <p className="text-sm text-muted-foreground mb-6">Data from sp_GetEventDailySales stored procedure</p>
          
          {salesData.dailySales && salesData.dailySales.length > 0 ? (
            <div className="space-y-4">
              {salesData.dailySales.map((day, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-muted-foreground">
                    {new Date(day.saleDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex-1">
                    <Progress 
                      value={Math.min((day.ticketsSold / Math.max(salesData.totalCapacity, 1)) * 100, 100)} 
                      className="h-8"
                    />
                  </div>
                  <div className="w-32 text-right">
                    <p className="font-bold">${day.dailyRevenue?.toLocaleString() || '0'}</p>
                    <p className="text-sm text-muted-foreground">{day.ticketsSold} tickets</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No daily sales data available yet</p>
          )}
        </div>

        {/* Recent Orders - Data from sp_GetEventRecentOrders */}
        <div className="glass glass-border rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-2">Recent Orders</h2>
          <p className="text-sm text-muted-foreground mb-6">Data from sp_GetEventRecentOrders stored procedure</p>
          
          {salesData.recentOrders && salesData.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Ticket Type</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                {salesData.recentOrders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-medium">#{order.orderId}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>{order.ticketCategory}</TableCell>
                    <TableCell className="text-center">{order.quantity}</TableCell>
                    <TableCell className="text-right font-bold text-cta">
                      {formatVND(order.amount || 0)}
                    </TableCell>
                    <TableCell>
                      {new Date(order.purchaseDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'COMPLETED' 
                          ? 'bg-green-500/20 text-green-400'
                          : order.status === 'PENDING'
                          ? 'bg-cta/20 text-cta'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {order.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No orders yet</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventSales;
