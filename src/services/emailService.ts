
import { toast } from "sonner";
import { User } from "@/types/auth";

export interface EmailConfig {
  smtpServer: string;
  port: number;
  useSsl: boolean;
  username: string;
  password: string;
  fromAddress: string;
  fromName: string;
}

export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  cc?: string[];
  bcc?: string[];
  attachments?: { name: string; data: string }[];
}

// Default email configuration
const defaultEmailConfig: EmailConfig = {
  smtpServer: 'smtp.genena.com',
  port: 587,
  useSsl: true,
  username: '',
  password: '',
  fromAddress: 'ticketing@genena.com',
  fromName: 'Genena Ticketing System'
};

// Get email configuration
export const getEmailConfig = (): EmailConfig => {
  const storedConfig = localStorage.getItem('emailConfig');
  if (storedConfig) {
    try {
      return JSON.parse(storedConfig);
    } catch (error) {
      console.error('Error parsing stored email config:', error);
      return defaultEmailConfig;
    }
  }
  return defaultEmailConfig;
};

// Save email configuration
export const saveEmailConfig = (config: EmailConfig): void => {
  localStorage.setItem('emailConfig', JSON.stringify(config));
};

// Test email configuration
export const testEmailConfig = async (config: EmailConfig): Promise<boolean> => {
  try {
    // In a real application, this would send a request to a backend API
    console.log('Testing email configuration:', config);
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple validation
    if (!config.smtpServer || !config.port || !config.username || !config.password) {
      toast.error('Email server configuration is incomplete');
      return false;
    }
    
    // Success
    toast.success('Email configuration test successful!');
    return true;
  } catch (error) {
    console.error('Error testing email configuration:', error);
    toast.error('Failed to test email configuration');
    return false;
  }
};

// Send email notification
export const sendEmail = async (message: EmailMessage): Promise<boolean> => {
  try {
    const config = getEmailConfig();
    
    // In a real application, this would send a request to a backend API
    console.log('Sending email:', { config, message });
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Log message for debugging
    console.log(`Email would be sent to ${message.to}`);
    console.log(`Subject: ${message.subject}`);
    console.log(`Body: ${message.body}`);
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Send ticket notification email
export const sendTicketNotificationEmail = async (
  recipient: User,
  ticketId: string,
  ticketTitle: string,
  notificationType: 'new' | 'update' | 'resolved' | 'comment',
  senderName?: string
): Promise<boolean> => {
  try {
    // Build email content based on notification type
    let subject = '';
    let body = '';
    
    switch (notificationType) {
      case 'new':
        subject = `[Ticket #${ticketId}] New ticket assigned to you`;
        body = `
          <h2>New Ticket Assigned</h2>
          <p>Hello ${recipient.name},</p>
          <p>A new ticket has been assigned to you:</p>
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
          <p><strong>Title:</strong> ${ticketTitle}</p>
          <p><strong>Assigned by:</strong> ${senderName || 'System'}</p>
          <p>Please login to the Genena Ticketing System to view and respond to this ticket.</p>
          <p><a href="${window.location.origin}/tickets/${ticketId}">Click here to view the ticket</a></p>
        `;
        break;
        
      case 'update':
        subject = `[Ticket #${ticketId}] Ticket updated`;
        body = `
          <h2>Ticket Updated</h2>
          <p>Hello ${recipient.name},</p>
          <p>A ticket has been updated:</p>
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
          <p><strong>Title:</strong> ${ticketTitle}</p>
          <p><strong>Updated by:</strong> ${senderName || 'System'}</p>
          <p>Please login to the Genena Ticketing System to view the changes.</p>
          <p><a href="${window.location.origin}/tickets/${ticketId}">Click here to view the ticket</a></p>
        `;
        break;
        
      case 'resolved':
        subject = `[Ticket #${ticketId}] Ticket resolved`;
        body = `
          <h2>Ticket Resolved</h2>
          <p>Hello ${recipient.name},</p>
          <p>A ticket has been resolved:</p>
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
          <p><strong>Title:</strong> ${ticketTitle}</p>
          <p><strong>Resolved by:</strong> ${senderName || 'System'}</p>
          <p>Please login to the Genena Ticketing System to view the resolution.</p>
          <p><a href="${window.location.origin}/tickets/${ticketId}">Click here to view the ticket</a></p>
        `;
        break;
        
      case 'comment':
        subject = `[Ticket #${ticketId}] New comment added`;
        body = `
          <h2>New Comment Added</h2>
          <p>Hello ${recipient.name},</p>
          <p>A new comment has been added to a ticket:</p>
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
          <p><strong>Title:</strong> ${ticketTitle}</p>
          <p><strong>Comment by:</strong> ${senderName || 'System'}</p>
          <p>Please login to the Genena Ticketing System to view the comment.</p>
          <p><a href="${window.location.origin}/tickets/${ticketId}">Click here to view the ticket</a></p>
        `;
        break;
    }
    
    // Send the email
    return await sendEmail({
      to: recipient.email,
      subject,
      body
    });
  } catch (error) {
    console.error('Error sending ticket notification email:', error);
    return false;
  }
};
