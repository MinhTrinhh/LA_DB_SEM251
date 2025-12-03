import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, TrendingUp, Users, DollarSign } from "lucide-react";
import { mockEvents } from "@/data/mockEvents";
import { mockSalesData } from "@/data/mockOrganizer";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const EventSales = () => {
  const { id } = useParams();
  const event = mockEvents.find(e => e.id === id);
  const salesData = mockSalesData[id || ''];

  if (!event || !salesData) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Event Not Found</h1>
          <Button asChild>
            <Link to="/organize">Back to Dashboard</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const capacityPercentage = (salesData.ticketsSold / salesData.totalCapacity) * 100;

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

        {/* Event Header */}
        <div className="glass glass-border rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              <p className="text-muted-foreground">
                {new Date(event.date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })} • {event.venue}
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Sales Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass glass-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-cta/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-cta" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-cta">
                  ${salesData.totalRevenue.toLocaleString()}
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
                  {salesData.ticketsSold.toLocaleString()}
                  <span className="text-lg text-muted-foreground">
                    /{salesData.totalCapacity.toLocaleString()}
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

        {/* Ticket Categories */}
        <div className="glass glass-border rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Ticket Categories</h2>
          <div className="space-y-6">
            {salesData.categoryBreakdown.map((category, index) => {
              const percentage = (category.sold / category.total) * 100;
              return (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.sold} of {category.total} sold
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-cta">
                        ${category.revenue.toLocaleString()}
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
        </div>

        {/* Daily Sales Chart */}
        <div className="glass glass-border rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Daily Sales</h2>
          <div className="space-y-4">
            {salesData.dailySales.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm text-muted-foreground">
                  {new Date(day.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric'
                  })}
                </div>
                <div className="flex-1">
                  <Progress 
                    value={(day.tickets / 1200) * 100} 
                    className="h-8"
                  />
                </div>
                <div className="w-32 text-right">
                  <p className="font-bold">${day.revenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{day.tickets} tickets</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="glass glass-border rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
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
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>{order.ticketCategory}</TableCell>
                    <TableCell className="text-center">{order.quantity}</TableCell>
                    <TableCell className="text-right font-bold text-cta">
                      ${order.amount}
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
                        order.status === 'completed' 
                          ? 'bg-green-500/20 text-green-400'
                          : order.status === 'pending'
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventSales;
