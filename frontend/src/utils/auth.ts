import logger from '../../logger.config.mjs';
import { OnIncompletePaymentFoundType } from '@/constants/types';

export const onIncompletePaymentFound : OnIncompletePaymentFoundType = payment => {
  logger.info('onIncompletePaymentFound:', { payment });
}