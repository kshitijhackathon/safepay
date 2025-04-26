import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Share2 } from 'lucide-react';
import { formatCurrency, parseUrlParams, getLocalStorageItem, setLocalStorageItem, formatDate, generateTransactionId } from '@/lib/utils';

interface TransactionDetails {
  amount: string;
  to: string;
  upiId: string;
  fromUpiId: string;
  transactionId: string;
  date: string;
  app: string;
}

interface TransactionInput {
  amount: string | number;
  to?: string;
  upiId?: string;
  fromUpiId?: string;
  transactionId?: string;
  date?: Date;
  app?: string;
}

interface TransactionHistoryItem {
  id: string;
  title: string;
  upiId: string;
  fromUpiId?: string;
  amount: number;
  timestamp: string;
  status: string;
  type: string;
  app: string;
}

export default function Success() {
  const [location, setLocation] = useLocation();
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails>({
    amount: '850.00',
    to: 'City Supermarket',
    upiId: 'citysupermarket@upi',
    fromUpiId: 'yourname@okhdfc',
    transactionId: `UPI${Date.now().toString().substring(5)}`,
    date: new Date().toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    app: 'UPI App'
  });

  // Extract transaction details from URL query parameters
  useEffect(() => {
    try {
      // Use our utility function to safely parse URL params
      const params = parseUrlParams(location);
      
      // Get parameters from URL
      const amount = params.get('amount');
      const to = params.get('merchantName') || params.get('to');
      const upiId = params.get('upiId');
      const fromUpiId = params.get('fromUpiId');
      const txnId = params.get('txnId') || params.get('paymentIntentId');
      const app = params.get('app') || params.get('paymentMethod') || 'Card';
      
      // Check if we have a stripe payment
      const isStripePayment = params.get('paymentMethod') === 'stripe' || app === 'card' || app === 'Card';
      
      // Create a transaction ID if none was provided
      const finalTxnId = txnId || generateTransactionId(isStripePayment ? 'STRIPE' : 'UPI');
      
      // Format date using our utility
      const formattedDate = formatDate(new Date());
      
      // Log the data received from URL for debugging
      console.log('Transaction data from URL:', { amount, to, upiId, fromUpiId, txnId, app });
      
      // Update transaction details with URL params if available
      setTransactionDetails((current) => ({
        ...current,
        amount: amount || current.amount,
        to: to || current.to,
        upiId: upiId || current.upiId,
        fromUpiId: fromUpiId || '',
        transactionId: finalTxnId,
        date: formattedDate,
        app: isStripePayment ? 'Credit/Debit Card' : (app || current.app)
      }));
      
      // Save transaction to history in local storage
      saveTransactionToHistory({
        amount: amount || transactionDetails.amount, // Keep as string, will be parsed later
        to: to || transactionDetails.to,
        upiId: upiId || transactionDetails.upiId,
        fromUpiId: fromUpiId || '',
        transactionId: finalTxnId,
        app: isStripePayment ? 'Credit/Debit Card' : (app || transactionDetails.app),
        date: new Date() // Date object for formatting
      });
    } catch (error) {
      console.error('Error parsing transaction details:', error);
    }
  }, [location]);

  // Function to save transaction to history in local storage
  const saveTransactionToHistory = (transaction: TransactionInput) => {
    try {
      // Use our utility to safely get local storage data
      const history = getLocalStorageItem('transactionHistory', []) as TransactionHistoryItem[];
      
      // Add new transaction to history
      const newTransaction: TransactionHistoryItem = {
        id: transaction.transactionId || '',
        title: transaction.to || '',
        upiId: transaction.upiId || '',
        fromUpiId: transaction.fromUpiId,
        amount: -Math.abs(parseFloat(transaction.amount?.toString() || '0')), // Negative for payment
        timestamp: new Date().toISOString(), 
        status: 'Completed',
        type: 'debit',
        app: transaction.app || 'UPI'
      };
      
      // Add to beginning of array
      history.unshift(newTransaction);
      
      // Limit history to 50 items
      const limitedHistory = history.slice(0, 50);
      
      // Use our utility to safely set local storage data
      setLocalStorageItem('transactionHistory', limitedHistory);
    } catch (error) {
      console.error('Error saving transaction history:', error);
    }
  };

  // Function to share receipt
  const shareReceipt = () => {
    try {
      if (navigator.share) {
        navigator.share({
          title: 'Payment Receipt',
          text: `Payment of ${formatCurrency(parseFloat(transactionDetails.amount.toString()))} to ${transactionDetails.to} (${transactionDetails.upiId}) was successful. Transaction ID: ${transactionDetails.transactionId}`
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        alert('Share option is not supported on this browser.');
      }
    } catch (error) {
      console.error('Error sharing receipt:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 min-h-screen">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <Check className="w-12 h-12 text-green-600" strokeWidth={2} />
      </div>
      
      <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
      <p className="text-gray-500 mb-6">Your transaction has been completed</p>
      
      <Card className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 w-full mb-8">
        <div className="flex justify-between mb-3">
          <p className="text-gray-500">Amount</p>
          <p className="font-semibold">{formatCurrency(parseFloat(transactionDetails.amount.toString()))}</p>
        </div>
        <div className="flex justify-between mb-3">
          <p className="text-gray-500">From</p>
          <p className="font-semibold text-sm">{transactionDetails.fromUpiId}</p>
        </div>
        <div className="flex justify-between mb-3">
          <p className="text-gray-500">To</p>
          <p className="font-semibold">{transactionDetails.to}</p>
        </div>
        <div className="flex justify-between mb-3">
          <p className="text-gray-500">UPI ID</p>
          <p className="font-semibold text-sm">{transactionDetails.upiId}</p>
        </div>
        <div className="flex justify-between mb-3">
          <p className="text-gray-500">Payment App</p>
          <p className="font-semibold">{transactionDetails.app}</p>
        </div>
        <div className="flex justify-between mb-3">
          <p className="text-gray-500">Transaction ID</p>
          <p className="font-semibold text-sm">{transactionDetails.transactionId}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-gray-500">Date & Time</p>
          <p className="font-semibold">{transactionDetails.date}</p>
        </div>
      </Card>
      
      <div className="flex gap-3 w-full mb-4">
        <Button
          onClick={shareReceipt}
          variant="outline"
          className="flex-1 font-semibold py-4 px-6 rounded-xl shadow-sm border border-gray-200"
        >
          <Share2 className="w-4 h-4 mr-2" /> Share
        </Button>
        <Button
          onClick={() => setLocation('/history')}
          variant="outline"
          className="flex-1 font-semibold py-4 px-6 rounded-xl shadow-sm border border-gray-200"
        >
          View History
        </Button>
      </div>
      
      <Button
        onClick={() => setLocation('/home')}
        className="bg-primary text-white font-semibold py-4 px-6 rounded-xl shadow-md w-full"
      >
        Done
      </Button>
    </div>
  );
}
