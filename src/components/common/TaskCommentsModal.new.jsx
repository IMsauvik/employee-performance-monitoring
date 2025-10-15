import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../utils/storage';
import { 
  X, Send, AlertTriangle, AtSign, User, Clock, Edit2, Trash2,
  MessageCircle, Smile, ThumbsUp, Heart, Star, UserCheck, Wifi, WifiOff 
} from 'lucide-react';
import { useTaskDiscussion } from '../../hooks/useTaskDiscussion';
import { TypingIndicator } from './TypingIndicator';
import { Reactions } from './Reactions';
import { LoadingSpinner } from './LoadingSpinner';
import { eventBus } from '../../utils/eventBus';
import NotificationService from '../../services/notificationService';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const REACTION_EMOJIS = {
  like: { icon: ThumbsUp, label: 'Like' },
  love: { icon: Heart, label: 'Love' },
  star: { icon: Star, label: 'Star' }
};