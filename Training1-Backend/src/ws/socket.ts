import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyJWT } from '../utils/auth';
import { redis } from '../config/redis';

export interface SocketUser {
  userId: string;
  tenantId: string;
  roles: string[];
}

export function createSocketServer(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN_FRONTEND?.split(','),
      credentials: true
    },
    path: '/socket.io'
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = await verifyJWT(token);
      socket.data.user = decoded as SocketUser;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const user = socket.data.user as SocketUser;
    console.log(`User connected: ${user.userId}`);

    // Join user's personal room for notifications
    socket.join(`user:${user.userId}`);
    socket.join(`tenant:${user.tenantId}`);

    // Track online status
    redis.sadd(`online:${user.tenantId}`, user.userId);
    redis.expire(`online:${user.tenantId}`, 300); // 5 min TTL

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.userId}`);
      redis.srem(`online:${user.tenantId}`, user.userId);
    });

    // Heartbeat for presence
    socket.on('heartbeat', async () => {
      await redis.sadd(`online:${user.tenantId}`, user.userId);
      await redis.expire(`online:${user.tenantId}`, 300);
      socket.emit('heartbeat:ack');
    });
  });

  // Register namespaces
  registerLiveNamespace(io);
  registerNotificationNamespace(io);

  return io;
}

function registerLiveNamespace(io: SocketIOServer) {
  const liveNs = io.of('/live');

  liveNs.use(async (socket, next) => {
    // Reuse main auth
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    
    try {
      const decoded = await verifyJWT(token);
      socket.data.user = decoded as SocketUser;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  liveNs.on('connection', (socket) => {
    const user = socket.data.user as SocketUser;

    // Join live session
    socket.on('session:join', async (sessionId: string) => {
      // TODO: Verify user has access to session
      socket.join(`session:${sessionId}`);
      
      // Broadcast user joined
      socket.to(`session:${sessionId}`).emit('session:user-joined', {
        userId: user.userId,
        timestamp: new Date()
      });

      // Send current participants
      const sockets = await liveNs.in(`session:${sessionId}`).fetchSockets();
      socket.emit('session:participants', {
        count: sockets.length,
        users: sockets.map(s => s.data.user)
      });
    });

    // Leave live session
    socket.on('session:leave', (sessionId: string) => {
      socket.leave(`session:${sessionId}`);
      socket.to(`session:${sessionId}`).emit('session:user-left', {
        userId: user.userId,
        timestamp: new Date()
      });
    });

    // Chat message
    socket.on('chat:message', (data: { sessionId: string; message: string }) => {
      liveNs.to(`session:${data.sessionId}`).emit('chat:message', {
        userId: user.userId,
        message: data.message,
        timestamp: new Date()
      });
    });

    // Poll vote
    socket.on('poll:vote', async (data: { pollId: string; optionId: string }) => {
      // TODO: Store vote in database
      // TODO: Broadcast updated results to session
    });

    // Raise hand
    socket.on('session:raise-hand', (sessionId: string) => {
      liveNs.to(`session:${sessionId}`).emit('session:hand-raised', {
        userId: user.userId,
        timestamp: new Date()
      });
    });

    // Reaction
    socket.on('session:react', (data: { sessionId: string; reaction: string }) => {
      liveNs.to(`session:${data.sessionId}`).emit('session:reaction', {
        userId: user.userId,
        reaction: data.reaction,
        timestamp: new Date()
      });
    });

    // Screen sharing
    socket.on('screen:start', (sessionId: string) => {
      liveNs.to(`session:${sessionId}`).emit('screen:started', {
        userId: user.userId
      });
    });

    socket.on('screen:stop', (sessionId: string) => {
      liveNs.to(`session:${sessionId}`).emit('screen:stopped', {
        userId: user.userId
      });
    });

    // WebRTC signaling
    socket.on('webrtc:offer', (data: { sessionId: string; targetUserId: string; offer: any }) => {
      liveNs.to(`user:${data.targetUserId}`).emit('webrtc:offer', {
        fromUserId: user.userId,
        offer: data.offer
      });
    });

    socket.on('webrtc:answer', (data: { targetUserId: string; answer: any }) => {
      liveNs.to(`user:${data.targetUserId}`).emit('webrtc:answer', {
        fromUserId: user.userId,
        answer: data.answer
      });
    });

    socket.on('webrtc:ice-candidate', (data: { targetUserId: string; candidate: any }) => {
      liveNs.to(`user:${data.targetUserId}`).emit('webrtc:ice-candidate', {
        fromUserId: user.userId,
        candidate: data.candidate
      });
    });
  });
}

function registerNotificationNamespace(io: SocketIOServer) {
  const notifyNs = io.of('/notifications');

  notifyNs.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    
    try {
      const decoded = await verifyJWT(token);
      socket.data.user = decoded as SocketUser;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  notifyNs.on('connection', (socket) => {
    const user = socket.data.user as SocketUser;
    
    // Join user's notification channel
    socket.join(`user:${user.userId}`);

    // Mark notification as read
    socket.on('notification:read', async (notificationId: string) => {
      // TODO: Update database
      socket.emit('notification:read:ack', { notificationId });
    });

    // Mark all as read
    socket.on('notifications:read-all', async () => {
      // TODO: Update database
      socket.emit('notifications:read-all:ack');
    });
  });
}

// Helper functions for emitting events from HTTP routes
export async function emitToUser(io: SocketIOServer, userId: string, event: string, data: any) {
  io.of('/notifications').to(`user:${userId}`).emit(event, data);
}

export async function emitToSession(io: SocketIOServer, sessionId: string, event: string, data: any) {
  io.of('/live').to(`session:${sessionId}`).emit(event, data);
}

export async function emitToTenant(io: SocketIOServer, tenantId: string, event: string, data: any) {
  io.to(`tenant:${tenantId}`).emit(event, data);
}
