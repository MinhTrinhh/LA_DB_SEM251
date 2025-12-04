import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, QrCode, AlertCircle } from 'lucide-react';
import { OrderDTO } from '@/api/orders.api';

interface PaymentQRModalProps {
  open: boolean;
  onClose: () => void;
  order: OrderDTO;
}

const PaymentQRModal: React.FC<PaymentQRModalProps> = ({ open, onClose, order }) => {
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Scan QR Code to Pay
          </DialogTitle>
          <DialogDescription>
            Open your banking app and scan the QR code below to complete payment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code Display */}
          {order.qrCodeUrl ? (
            <Card className="p-4 bg-white">
              <div className="flex justify-center">
                <img
                  src={order.qrCodeUrl}
                  alt="Payment QR Code"
                  className="w-64 h-64 object-contain"
                />
              </div>
            </Card>
          ) : (
            <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm">QR code not available</p>
              </div>
            </Card>
          )}

          {/* Payment Details */}
          <Card className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Order ID:</span>
              <span className="font-semibold">#{order.orderId}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount:</span>
              <span className="text-lg font-bold text-primary">
                {formatVND(order.amountOfMoney)}
              </span>
            </div>

            {order.paymentDescription && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Description:</span>
                <span className="font-mono text-sm">{order.paymentDescription}</span>
              </div>
            )}

            {order.paymentMethod && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Bank:</span>
                <span className="text-sm font-medium">{order.paymentMethod.name}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded text-xs font-medium">
                {order.orderStatus}
              </span>
            </div>
          </Card>

          {/* Instructions */}
          <Card className="p-4 bg-blue-500/10 border-blue-500/20">
            <div className="space-y-2 text-sm text-blue-600">
              <p className="font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                How to pay:
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-6">
                <li>Open your banking app</li>
                <li>Select "Scan QR Code" or "Transfer"</li>
                <li>Scan the QR code above</li>
                <li>Verify the amount and description</li>
                <li>Complete the payment</li>
              </ol>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              className="flex-1"
              onClick={onClose}
            >
              I've Paid
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Your order will be confirmed once payment is received
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentQRModal;

