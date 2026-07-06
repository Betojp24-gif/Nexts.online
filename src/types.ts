export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  ageRange: string;
  image: string;
  stock: number;
  popular: boolean;
  createdAt?: any;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id?: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  dni: string;
  address: string;
  city: string;
  province: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: 'mercadopago' | 'stripe' | 'paypal' | 'transferencia';
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: any;
  paymentDetails?: {
    cardBrand?: string;
    last4?: string;
    transactionId?: string;
    transferReceiptChecked?: boolean;
    referenceCode?: string;
  };
}

export interface PaymentConfig {
  mercadopagoActive: boolean;
  mercadopagoPublicKey: string;
  mercadopagoAccessToken: string;
  mercadopagoSandbox: boolean;
  stripeActive: boolean;
  stripePublicKey: string;
  stripeSecretKey: string;
  paypalActive: boolean;
  paypalClientId: boolean;
  transferenciaActive: boolean;
  transferenciaBank: string;
  transferenciaCbu: string;
  transferenciaAlias: string;
  transferenciaHolder: string;
  transferenciaCuit: string;
  currency: 'ARS' | 'USD';
  updatedAt?: any;
  updatedBy?: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'student';
  phone?: string;
  profileImage?: string;
}

// Keep legacy Course types to prevent compilation issues until other components are fully adjusted
export interface CourseModule {
  title: string;
  topics: string[];
  evaluation: string;
}

export interface Course {
  id: string;
  title: string;
  hours: number;
  price: number;
  category: string;
  image: string;
  objective: string;
  summary: string;
}
