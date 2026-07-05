import {
  Award,
  CheckCircle2,
  Clock,
  Info,
  LogIn,
  ShieldCheck,
  Upload,
  UserPlus,
  XCircle,
} from 'lucide-react';

/**
 * Get the appropriate icon for an activity type
 */
export function getActivityIcon(type: string) {
  switch (type) {
    case 'user_login':
      return <LogIn className="w-5 h-5 text-primary" />;
    case 'user_register':
      return <UserPlus className="w-5 h-5 text-primary" />;
    case 'onboarding_completed':
    case 'assessment_completed':
      return <CheckCircle2 className="w-5 h-5 text-primary" />;
    case 'credential_earned':
      return <Award className="w-5 h-5 text-primary" />;
    case 'cv_updated':
    case 'cv_uploaded':
    case 'cv_parsed':
      return <Upload className="w-5 h-5 text-foreground" />;
    case 'assessment_started':
      return <Clock className="w-5 h-5 text-muted-foreground" />;
    case 'assessment_abandoned':
      return <XCircle className="w-5 h-5 text-destructive" />;
    case 'blockchain_verified':
    case 'blockchain_issued':
      return <ShieldCheck className="w-5 h-5 text-primary" />;
    default:
      return <Info className="w-5 h-5 text-muted-foreground" />;
  }
}
