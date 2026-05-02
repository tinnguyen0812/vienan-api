import { Request } from 'express';
import { User } from '../../users/entities/user.entity';
import { Channel } from '../../channels/entities/channel.entity';
import { ApiKey } from '../../auth/entities/api-key.entity';

/**
 * Standard request interface with user or channel context.
 */
export interface RequestWithUser extends Request {
  user?: User;
  channelId?: string | null;
  channel?: Channel;
  apiKey?: ApiKey;
}
