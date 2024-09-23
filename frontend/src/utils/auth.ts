import logger from '../../logger.config.mjs';
import { OnIncompletePaymentFoundType } from '@/constants/pi';

export const onIncompletePaymentFound : OnIncompletePaymentFoundType = payment => {
  logger.info('onIncompletePaymentFound:', { payment });
}