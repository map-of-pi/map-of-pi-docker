'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef, useContext } from 'react';
import { resolveRating } from '../util/ratingUtils';
import { OutlineBtn } from '@/components/shared/Forms/Buttons/Buttons';
import EmojiPicker from '@/components/shared/Review/emojipicker';
import ToggleCollapse from '@/components/shared/Seller/ToggleCollapse';
import Skeleton from '@/components/skeleton/skeleton';
import { IReviewOutput } from '@/constants/types';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, TextField } from '@mui/material';
import { fetchReviews } from '@/services/reviewsApi';
import { resolveDate } from '@/utils/date';
import { AppContext } from '../../../../../../context/AppContextProvider';
import logger from '../../../../../../logger.config.mjs';

interface ReviewInt {
  heading: string;
  date: string;
  time: string;
  giver: string;
  receiver: string;
  reviewId: string;
  receiverId: string;
  giverId: string;
  reaction: string;
  unicode: string;
  image: string;
}

function SellerReviews({
  params,
  searchParams,
}: {
  params: any;
  searchParams: any;
}) {
  const t = useTranslations();
  const userName = searchParams.user_name;
  const userId = params.id;

  const [giverReviews, setGiverReviews] = useState<ReviewInt[] | null>(null);
  const [receiverReviews, setReceiverReviews] = useState<ReviewInt[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const { currentUser, setReload, reload } = useContext(AppContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchBarValue, setSearchBarValue] = useState('');

  // Reusable function to process and filter reviews
  const processReviews = (data: IReviewOutput[], userId: string): { giverReviews: ReviewInt[], receiverReviews: ReviewInt[] } => {
    const reviews = data
      .map((feedback: IReviewOutput) => {
        if (feedback.review_giver_id === userId || feedback.review_receiver_id === userId) {
          const { date, time } = resolveDate(feedback.review_date);
          const { reaction, unicode } = resolveRating(feedback.rating) || {};

          return {
            heading: feedback.comment,
            date,
            time,
            giver: feedback.giver,
            receiver: feedback.receiver,
            giverId: feedback.review_giver_id,
            receiverId: feedback.review_receiver_id,
            reviewId: feedback._id,
            reaction,
            unicode
          };
        }
        return null; // Ignore irrelevant reviews
      })
      .filter((review): review is ReviewInt => review !== null);

    // Separate into giver and receiver reviews
    return {
      giverReviews: reviews.filter((review) => review.giverId === userId),
      receiverReviews: reviews.filter((review) => review.receiverId === userId)
    };
  };
  
  useEffect(() => {
    const fetchSellerReviews = async () => {
      setLoading(true);
      try {
        logger.info(`Fetching reviews for seller ID: ${userId}`);
        const data = await fetchReviews(userId);

        if (data && data.length > 0) {
          logger.info(`Fetched ${data.length} reviews for seller ID: ${userId}`);
          const { giverReviews, receiverReviews } = processReviews(data, userId);
          setGiverReviews(giverReviews);
          setReceiverReviews(receiverReviews);
        } else {
          logger.warn(`No reviews found for seller ID: ${userId}`);
          setGiverReviews([]);
          setReceiverReviews([]);
        }
      } catch (error) {
        logger.error(`Error fetching reviews for seller ID: ${userId}`, { error });
        setError('Error fetching reviews. Please try again later.');
      } finally {
        setLoading(false);
        setReload(false);
      }
    };

    fetchSellerReviews();
  }, [userId, currentUser]);

  // Handle search logic
  const handleSearch = async () => {
    setReload(true);
    try {
      logger.info(`Searching reviews for seller ID: ${userId} with query: ${searchBarValue}`);
      const data = await fetchReviews(userId, searchBarValue);

      if (data && data.length > 0) {
        logger.info(`Found ${data.length} reviews for seller ID: ${userId}`);
        const { giverReviews, receiverReviews } = processReviews(data, userId);
        setGiverReviews(giverReviews);
        setReceiverReviews(receiverReviews);
      } else {
        logger.warn(`No reviews found for seller ID: ${userId} with query: ${searchBarValue}`);
        setGiverReviews([]);
        setReceiverReviews([]);
      }
    } catch (error) {
      logger.error(`Error searching reviews for seller ID: ${userId}`, { error });
      setError('Error searching reviews. Please try again later.');
    } finally {
      setReload(false);
    }
  };

  const handleSearchBarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    logger.debug(`Search bar value changed: ${event.target.value}`);
    setSearchBarValue(event.target.value);
  };

  if (loading) {
    logger.info('Loading seller reviews..');
    return <Skeleton type='seller_review' />;
  }

  return (
    <>
      {error && <div className="error">{error}</div>}
      <div className="px-4 py-[20px] text-[#333333] sm:max-w-[520px] w-full m-auto gap-5">
        <h1 className="text-[#333333] text-lg font-semibold md:font-bold md:text-2xl mb-1">
          {t('SCREEN.REVIEWS.REVIEWS_HEADER')}
        </h1>

        {/* Search area */}
        <div className='flex gap-3 items-center justify-items-center py-3'>
          <span>{t('SHARED.PIONEER_LABEL')}</span>
          <FormControl className="flex-grow mr-2">
            <TextField
              id="search-input"
              type="text"
              variant="outlined"
              color="success"
              className="bg-none hover:bg-gray-100 w-full rounded-lg"
              placeholder={userName}
              value={searchBarValue}
              onChange={handleSearchBarChange}
              ref={inputRef}
              autoCorrect="off"
            />
          </FormControl>
          <button
            aria-label="search"
            onClick={handleSearch}
            className="bg-primary rounded h-full w-15 p-[15.5px] flex items-center justify-center hover:bg-gray-600"
          >
            <SearchIcon className="text-[#ffc153]" />
          </button>
        </div>

        <ToggleCollapse header={t('SCREEN.REVIEWS.GIVE_REVIEW_SECTION_HEADER')}>
          <div>
            <EmojiPicker sellerId={userId} setIsSaveEnabled={setIsSaveEnabled} currentUser={currentUser} setReload={setReload} />
          </div>
        </ToggleCollapse>      
        <ToggleCollapse header={t('SCREEN.REVIEWS.REVIEWS_GIVEN_SECTION_HEADER')}>
          {reload 
            ? <Skeleton type='seller_review' />
            : giverReviews && giverReviews.map((review, index) => (
              <div key={index} className="seller_item_container mb-5">
                <div className="flex justify-between items-start mb-3">
                  {/* Left content */}
                  <div className="flex-grow">
                    <p className="text-primary text-sm">
                      {review.giver} {' -> '}
                      <span className="text-primary text-sm">{review.receiver}</span>
                    </p>
                    <p className="text-md break-words">{review.heading}</p>
                  </div>

                  {/* Right content */}
                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-[#828282] text-sm text-right whitespace-nowrap">
                      <p>{review.date}</p>
                      <p>{review.time}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Image
                        src={review.image}
                        alt="emoji image"
                        width={50}
                        height={50}
                        className="object-cover rounded-md"
                      />
                      <p className="text-xl max-w-[50px]" title={review.reaction}>
                        {review.unicode}
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <Link href={`/seller/reviews/feedback/${review.reviewId}?seller_name=${review.giver}`}>
                        <OutlineBtn label={t('SHARED.REPLY')} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          }
        </ToggleCollapse>
 
        <ToggleCollapse header={t('SCREEN.REVIEWS.REVIEWS_RECEIVED_SECTION_HEADER')} open={true}>
        {reload
          ? <Skeleton type='seller_review' />
          : receiverReviews && receiverReviews.map((review, index) => (
            <div key={index} className="seller_item_container mb-5">
              <div className="flex justify-between items-start mb-3">
                {/* Left content */}
                <div className="flex-grow">
                  <p className="text-primary text-sm">
                    {review.giver} {' -> '}
                    <span className="text-primary text-sm">{review.receiver}</span>
                  </p>
                  <p className="text-md break-words">{review.heading}</p>
                </div>

                {/* Right content */}
                <div className="flex flex-col items-end space-y-2">
                  <div className="text-[#828282] text-sm text-right whitespace-nowrap">
                    <p>{review.date}</p>
                    <p>{review.time}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Image
                      src={review.image}
                      alt="emoji image"
                      width={50}
                      height={50}
                      className="object-cover rounded-md"
                    />
                    <p className="text-xl max-w-[50px]" title={review.reaction}>
                      {review.unicode}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <Link href={`/seller/reviews/feedback/${review.reviewId}?seller_name=${review.giver}`}>
                      <OutlineBtn label={t('SHARED.REPLY')} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        }
        </ToggleCollapse>
      </div>
    </>
  );
}

export default SellerReviews;
