import { Worker } from 'bullmq';
import { EmailJobData } from '../queues';
import nodemailer from 'nodemailer';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379
};

// Create email transporter
const transporter = nodemailer.createTransporter(process.env.SMTP_URL || {
  host: 'localhost',
  port: 1025,
  secure: false
});

export const emailWorker = new Worker(
  'email-sending',
  async (job) => {
    const data = job.data as EmailJobData;
    console.log(`Sending email job ${job.id} to ${data.to}`);

    try {
      // Render email template
      const html = await renderEmailTemplate(data.template, data.data);

      // Send email
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@training1.local',
        to: data.to,
        subject: data.subject,
        html
      });

      console.log(`Email sent: ${info.messageId}`);

      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error('Email sending error:', error);
      throw error;
    }
  },
  { connection, concurrency: 10 }
);

async function renderEmailTemplate(template: string, data: Record<string, any>): Promise<string> {
  // Simple template rendering - in production use a proper template engine
  const templates: Record<string, (data: any) => string> = {
    'welcome': (data) => `
      <h1>Welcome to Training1, ${data.userName}!</h1>
      <p>Your account has been created successfully.</p>
      <p><a href="${data.loginUrl}">Login to get started</a></p>
    `,
    'course-assigned': (data) => `
      <h1>New Course Assigned</h1>
      <p>Hi ${data.userName},</p>
      <p>You have been assigned to: <strong>${data.courseName}</strong></p>
      ${data.dueDate ? `<p>Due date: ${new Date(data.dueDate).toLocaleDateString()}</p>` : ''}
      <p><a href="${data.courseUrl}">Start Course</a></p>
    `,
    'course-completed': (data) => `
      <h1>Congratulations!</h1>
      <p>You have successfully completed: <strong>${data.courseName}</strong></p>
      ${data.certificateUrl ? `<p><a href="${data.certificateUrl}">Download Certificate</a></p>` : ''}
    `,
    'assessment-due': (data) => `
      <h1>Assessment Reminder</h1>
      <p>Hi ${data.userName},</p>
      <p>Your assessment for <strong>${data.courseName}</strong> is due soon.</p>
      <p>Due date: ${new Date(data.dueDate).toLocaleDateString()}</p>
      <p><a href="${data.assessmentUrl}">Take Assessment</a></p>
    `,
    'live-session': (data) => `
      <h1>Live Session Starting Soon</h1>
      <p>Hi ${data.userName},</p>
      <p><strong>${data.sessionTitle}</strong> will start at ${new Date(data.startTime).toLocaleString()}</p>
      <p><a href="${data.joinUrl}">Join Session</a></p>
    `
  };

  const templateFn = templates[template];
  if (!templateFn) {
    return `<p>${data.message || 'No message content'}</p>`;
  }

  return templateFn(data);
}

emailWorker.on('completed', (job) => {
  console.log(`Email job ${job.id} sent successfully`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Email job ${job?.id} failed:`, err.message);
});
