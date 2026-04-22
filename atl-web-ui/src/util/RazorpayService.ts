export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initializeRazorpayPayment = async (
  options: {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill: {
      name?: string;
      email?: string;
      contact?: string;
    };
    handler: (response: any) => void;
    theme?: {
      color: string;
    };
  }
) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error('Razorpay SDK failed to load. Are you online?');
  }

  const rzp = new (window as any).Razorpay(options);
  rzp.on('payment.failed', function (response: any) {
    console.error("Payment failed", response.error);
    alert("Payment Failed: " + response.error.description);
  });
  rzp.open();
};
