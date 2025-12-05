import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Ticket, Percent, DollarSign, Calendar, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { OrganizerPanel } from '@/components/OrganizerPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockEvents } from '@/data/mockEvents';
import { formatVND } from "@/utils/currency";

interface Voucher {
  id: string;
  code: string;
  discount: number;
  maxAmount: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
}

export default function VoucherPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([
    {
      id: '1',
      code: 'EARLYBIRD2024',
      discount: 20,
      maxAmount: 50,
      expiryDate: '2024-12-31',
      usageLimit: 100,
      usedCount: 23,
    },
    {
      id: '2',
      code: 'GROUPDEAL',
      discount: 15,
      maxAmount: 30,
      expiryDate: '2024-12-25',
      usageLimit: 50,
      usedCount: 12,
    },
  ]);
  
  const event = mockEvents.find(e => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl mb-4">Event not found</h2>
          <Button onClick={() => navigate('/organize')}>
            Back to Dashboard
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleCreateVoucher = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newVoucher: Voucher = {
      id: Date.now().toString(),
      code: (formData.get('code') as string).toUpperCase(),
      discount: parseFloat(formData.get('discount') as string),
      maxAmount: parseFloat(formData.get('maxAmount') as string),
      expiryDate: formData.get('expiryDate') as string,
      usageLimit: parseInt(formData.get('usageLimit') as string),
      usedCount: 0,
    };
    setVouchers([...vouchers, newVoucher]);
    setShowCreateForm(false);
    e.currentTarget.reset();
  };

  const deleteVoucher = (voucherId: string) => {
    setVouchers(vouchers.filter(v => v.id !== voucherId));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <OrganizerPanel />

        <div className="flex-1 py-8 px-8">
          <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/organize')}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold mb-2">Vouchers</h1>
            <p className="text-muted-foreground">Create and manage discount vouchers for {event.title}</p>
          </div>

          <div>
            {/* Create Voucher Button */}
            <div className="mb-6">
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                variant="cta"
                className="gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Voucher
              </Button>
            </div>

            {/* Create Voucher Form */}
            {showCreateForm && (
              <div className="glass glass-border rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Create New Voucher</h2>
                  <Button
                    onClick={() => setShowCreateForm(false)}
                    variant="ghost"
                    size="icon"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <form onSubmit={handleCreateVoucher} className="space-y-4">
                  <div>
                    <Label htmlFor="code">Voucher Code *</Label>
                    <Input
                      id="code"
                      name="code"
                      type="text"
                      placeholder="e.g., SUMMER2024"
                      className="uppercase"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">Will be converted to uppercase</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="discount">Discount Percentage (%) *</Label>
                      <div className="relative">
                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="discount"
                          name="discount"
                          type="number"
                          min="1"
                          max="100"
                          step="1"
                          placeholder="20"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="maxAmount">Max Discount Amount ($) *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="maxAmount"
                          name="maxAmount"
                          type="number"
                          min="1"
                          step="0.01"
                          placeholder="50"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          type="date"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="usageLimit">Usage Limit *</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="usageLimit"
                          name="usageLimit"
                          type="number"
                          min="1"
                          placeholder="100"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="cta"
                    >
                      Create Voucher
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Vouchers List */}
            <div className="glass glass-border rounded-xl">
              <div className="p-6 border-b border-border">
                <h2 className="text-2xl font-bold">Active Vouchers ({vouchers.length})</h2>
              </div>
              
              {vouchers.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Ticket className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No vouchers created yet</p>
                  <p className="text-sm mt-2">Click "Create Voucher" to add discount codes</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {vouchers.map((voucher) => {
                    const isExpired = new Date(voucher.expiryDate) < new Date();
                    const isLimitReached = voucher.usedCount >= voucher.usageLimit;
                    const usagePercent = (voucher.usedCount / voucher.usageLimit) * 100;

                    return (
                      <div key={voucher.id} className="p-6 hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                              <Ticket className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="text-xl font-mono">{voucher.code}</span>
                                {(isExpired || isLimitReached) && (
                                  <span className="px-2 py-1 bg-destructive/20 text-destructive rounded text-xs">
                                    {isExpired ? 'Expired' : 'Limit Reached'}
                                  </span>
                                )}
                                {!isExpired && !isLimitReached && (
                                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                                    Active
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground">Discount</div>
                                  <div className="text-primary">{voucher.discount}%</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Max Amount</div>
                                  <div>{formatVND(voucher.maxAmount)}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Expires</div>
                                  <div>{new Date(voucher.expiryDate).toLocaleDateString()}</div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Usage</div>
                                  <div>{voucher.usedCount} / {voucher.usageLimit}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => deleteVoucher(voucher.id)}
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>

                        {/* Usage Progress Bar */}
                        <div className="mt-4">
                          <div className="w-full bg-border rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                usagePercent >= 100 ? 'bg-destructive' : 'bg-gradient-to-r from-primary via-purple-500 to-pink-500'
                              }`}
                              style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
