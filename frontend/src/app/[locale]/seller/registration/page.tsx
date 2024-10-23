'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';

import TrustMeter from '@/components/shared/Review/TrustMeter';
import { OutlineBtn, Button } from '@/components/shared/Forms/Buttons/Buttons';
import {
  FileInput,
  TextArea,
  Input,
  Select,
  TelephoneInput
} from '@/components/shared/Forms/Inputs/Inputs';
import ConfirmDialog from '@/components/shared/confirm';
import ToggleCollapse from '@/components/shared/Seller/ToggleCollapse';
import Skeleton from '@/components/skeleton/skeleton';
import { itemData } from '@/constants/demoAPI';
import { IUserSettings, ISeller } from '@/constants/types';
import { fetchSellerRegistration, registerSeller } from '@/services/sellerApi';
import { fetchUserSettings } from '@/services/userSettingsApi';
import removeUrls from '../../../../utils/sanitize';
import { AppContext } from '../../../../../context/AppContextProvider';
import logger from '../../../../../logger.config.mjs';

const SellerRegistrationForm = () => {
  const HEADER = 'font-bold text-lg md:text-2xl';
  const SUBHEADER = 'font-bold mb-2';
  const router = useRouter();
  const t = useTranslations();
  const placeholderSeller = itemData.seller;
  
  const { currentUser, autoLoginUser } = useContext(AppContext);

  type IFormData = {
    sellerName: string;
    sellerType: string;
    sellerDescription: string;
    sellerAddress: string;
    email: string | null;
    phone_number: string | null;
    image: string;
  };

  // Initialize state with appropriate types
  const [formData, setFormData] = useState<IFormData>({
    sellerName: '',
    sellerType: 'testSeller',
    sellerDescription: '',
    sellerAddress: '',
    email: null,
    phone_number: null,
    image: '',
  });

  const [dbSeller, setDbSeller] = useState<ISeller | null>(null);
  const [dbUserSettings, setDbUserSettings] = useState<IUserSettings | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(
    dbSeller?.image || '',
  );
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');


  // Fetch seller data and user settings on component mount
  useEffect(() => {
    if (!currentUser) {
      logger.info('User not logged in; attempting auto-login..');
      autoLoginUser();
    }

    const getSellerData = async () => {
      try {
        const data = await fetchSellerRegistration();
        if (data) {
          setDbSeller(data);
        } else {
          setDbSeller(null);
        }
      } catch (error) {
        logger.error('Error fetching seller data:', { error });
        setError('Error fetching seller data.');
      } finally {
        setLoading(false);
      }
    };

    const getUserSettingsData = async () => {
      try {
        const settings = await fetchUserSettings();
        if (settings) {
          logger.info('Fetched user settings data successfully:', { settings });
          setDbUserSettings(settings);
        } else {
          logger.info('User settings not found.');
          setDbUserSettings(null);
        }
      } catch (error) {
        logger.error('Error fetching user settings data:', { error });
      }
    };

    getSellerData();
    getUserSettingsData();
  }, [currentUser]);

  // Initialize formData with dbSeller values if available
  useEffect(() => {
    if (dbSeller) {
      setFormData({
        sellerName: dbSeller.name || currentUser?.user_name || '',
        sellerType:
          dbSeller.seller_type || translatedSellerTypeOptions[2].value,
        sellerDescription: dbSeller.description || '',
        sellerAddress: dbSeller.address || '',
        email: dbUserSettings?.email || '',
        phone_number: dbUserSettings?.phone_number || '',
        image: dbSeller.image || '',
      });
    } else {
      setFormData({
        sellerName: translatedPreFilledText['retail-outlet-name'],
        sellerType: translatedSellerTypeOptions[2].value,
        sellerDescription: translatedPreFilledText['seller-description'],
        sellerAddress: translatedPreFilledText['seller-address'],
        email: '',
        phone_number: dbUserSettings?.phone_number || '',
        image: '',
      });
    }
  }, [dbSeller, dbUserSettings]);

  // Handle form changes
  useEffect(() => {
    const { sellerName, sellerType, sellerDescription, sellerAddress } =
      formData;
    setIsFormValid(
      !!(sellerName && sellerType && sellerDescription && sellerAddress),
    );
  }, [formData]);

  // function preview image upload
  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  // set the preview image if dbSeller changes
  useEffect(() => {
    if (dbSeller?.image) {
      setPreviewImage(dbSeller.image);
    }
  }, [dbSeller]);

  const handleChange = (
    e:
      | React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
      | { name: string; value: string },
  ) => {
    // handle such scenarios where the event might not have the typical e.target structure i.e., PhoneInput.
    const name = 'target' in e ? e.target.name : e.name;
    const value = 'target' in e ? e.target.value : e.value;

    // Create a new object with the updated form data
    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedFormData);

    // enable or disable save button based on form inputs
    const isFormFilled = Object.values(updatedFormData).some((v) => v !== '');
    setIsSaveEnabled(isFormFilled && isFormValid);
  };

  // Handle image upload
  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]; // only take the first file
    if (selectedFile) {
      setFile(selectedFile);

      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewImage(objectUrl);
      logger.info('Image selected for upload:', { selectedFile });

      setIsSaveEnabled(true);
    }
  };

  const handleNavigation = (nextLink: string) => {
    setLinkUrl(nextLink);
    
    if (isSaveEnabled) {
      setShowConfirmDialog(true); // Show confirm dialog when save is enabled
    } else {
      router.push(nextLink); // Direct navigation if save is not enabled
    }
  };

  const handleSave = async () => {
    // Check if user is authenticated and form is valid
    if (!currentUser) {
      logger.warn('Form submission failed: User not authenticated.');
      return toast.error(t('SHARED.VALIDATION.SUBMISSION_FAILED_USER_NOT_AUTHENTICATED'));
    }

    preFilledFields.forEach(({ fieldName, preFilledTextKey }) => {
      removePrefilledText(formData, fieldName, preFilledTextKey);
    });

    const formDataToSend = new FormData();
    formDataToSend.append('name', removeUrls(formData.sellerName));
    formDataToSend.append('seller_type', formData.sellerType);
    formDataToSend.append('description', removeUrls(formData.sellerDescription));
    formDataToSend.append('address', removeUrls(formData.sellerAddress));
    formDataToSend.append('email', formData.email ?? '');
    formDataToSend.append('phone_number', formData.phone_number?.toString() ?? '');
    // hardcode the value until the form element is built
    formDataToSend.append('order_online_enabled_pref', 'false');

    const mapCenter = dbSeller?.sell_map_center || dbUserSettings?.search_map_center;
    formDataToSend.append('sell_map_center', JSON.stringify(mapCenter));

    // Add the image if it exists
    if (file) {
      formDataToSend.append('image', file);
    }
    try {
      const data = await registerSeller(formDataToSend);
      if (data.seller) {
        setDbSeller(data.seller);
        setIsSaveEnabled(false);
        logger.info('Seller registration saved successfully:', { data });
        toast.success(t('SCREEN.SELLER_REGISTRATION.VALIDATION.SUCCESSFUL_REGISTRATION_SUBMISSION'));
        
        // Fetch updated user settings
        const updatedUserSettings = await fetchUserSettings();
        setDbUserSettings(updatedUserSettings);
      }
    } catch (error) {
      logger.error('Error saving seller registration:', { error });
    }
  };

  const translateSellerCategory = (category: string): string => {
    switch (category) {
      case 'activeSeller':
        return t('SCREEN.SELLER_REGISTRATION.SELLER_TYPE.SELLER_TYPE_OPTIONS.ACTIVE_SELLER');
      case 'inactiveSeller':
        return t('SCREEN.SELLER_REGISTRATION.SELLER_TYPE.SELLER_TYPE_OPTIONS.INACTIVE_SELLER');
      case 'testSeller':
        return t('SCREEN.SELLER_REGISTRATION.SELLER_TYPE.SELLER_TYPE_OPTIONS.TEST_SELLER');
      default:
        return '';
    }
  };

  const translatedPreFilledText = {
    'retail-outlet-name': t('SCREEN.SELLER_REGISTRATION.SELLER_RETAIL_OUTLET_PLACEHOLDER'),
    'seller-description': t('SCREEN.SELLER_REGISTRATION.SELLER_DETAILS_PLACEHOLDER'),
    'seller-address': t('SCREEN.SELLER_REGISTRATION.SELLER_ADDRESS_LOCATION_PLACEHOLDER'),
  };

  const preFilledFields: {
    fieldName: keyof IFormData;
    preFilledTextKey: keyof typeof translatedPreFilledText;
  }[] = [
      { fieldName: 'sellerName', preFilledTextKey: 'retail-outlet-name' },
      { fieldName: 'sellerDescription', preFilledTextKey: 'seller-description' },
      { fieldName: 'sellerAddress', preFilledTextKey: 'seller-address' },
    ];

  const removePrefilledText = (
    formData: IFormData,
    fieldName: keyof IFormData,
    prefilledTextKey: keyof typeof translatedPreFilledText,
  ) => {
    const currentValue = formData[fieldName];
    const preFilledText = translatedPreFilledText[prefilledTextKey];

    if (currentValue) {
      const updatedValue = currentValue.replace(preFilledText, '').trim();
      formData[fieldName] = updatedValue;
    }
  };
  
  const translatedSellerTypeOptions = [
    {
      value: 'activeSeller',
      name: t('SCREEN.SELLER_REGISTRATION.SELLER_TYPE.SELLER_TYPE_OPTIONS.ACTIVE_SELLER'),
    },
    {
      value: 'inactiveSeller',
      name: t('SCREEN.SELLER_REGISTRATION.SELLER_TYPE.SELLER_TYPE_OPTIONS.INACTIVE_SELLER'),
    },
    {
      value: 'testSeller',
      name: t('SCREEN.SELLER_REGISTRATION.SELLER_TYPE.SELLER_TYPE_OPTIONS.TEST_SELLER'),
    }
  ];

  if (loading) {
    logger.info('Loading Seller Registration Form.');
    return <Skeleton type="seller_registration" />;
  }

  return (
    <>
      <div className="w-full md:w-[500px] md:mx-auto p-4">
        <div className="text-center mb-5">
          <h3 className="text-gray-400 text-sm">
            {dbSeller ? dbSeller.name : ''}
          </h3>
          <h1 className={HEADER}>
            {t('SCREEN.SELLER_REGISTRATION.SELLER_REGISTRATION_HEADER')}
          </h1>
          <p className="text-gray-400 text-sm">
            {dbSeller ? translateSellerCategory(dbSeller.seller_type) : ''}
          </p>
        </div>

        <div className="mb-4">
          <h2 className={SUBHEADER}>
            {t('SCREEN.SELLER_REGISTRATION.SELLER_DETAILS_LABEL')}
          </h2>
          <p className="text-gray-400 text-sm">
            {t('SCREEN.SELLER_REGISTRATION.SELLER_DETAILS_PLACEHOLDER')}
          </p>
          <div className="mb-2">
            <TextArea
              name="sellerDescription"
              value={formData.sellerDescription}
              onChange={handleChange}
              styles={{ height: '200px' }}
            />
          </div>
        </div>

        <div className="mb-4 mt-3 ml-auto w-min">
          <Button
            label={t('SHARED.SAVE')}
            disabled={!isSaveEnabled}
            styles={{
              color: '#ffc153',
              height: '40px',
              padding: '10px 15px',
            }}
            onClick={handleSave}
          />
        </div>
        <Link
          href={{
            pathname: '/map-center', // Path to MapCenter component
            query: { entryType: 'sell' }, // Passing 'sell' as entryType
          }}>
          <Button
            label={t('SCREEN.SELLER_REGISTRATION.SELLER_SELL_CENTER')}
            styles={{
              color: '#ffc153',
              height: '40px',
              padding: '10px',
              marginLeft: 'auto',
            }}
          />
        </Link>

        <div className="spacing-7">
          {/* seller registration form fields toggle */}
          <ToggleCollapse
            header={t(
              'SCREEN.SELLER_REGISTRATION.SELLER_ADVANCED_SETTINGS_LABEL',
            )}
            open={true}>
            <div className="mb-4">
              <Input
                label={t(
                  'SCREEN.SELLER_REGISTRATION.SELLER_RETAIL_OUTLET_NAME',
                )}
                name="sellerName"
                type="text"
                value={formData.sellerName}
                onChange={handleChange}
              />

              <Select
                label={t(
                  'SCREEN.SELLER_REGISTRATION.SELLER_TYPE.SELLER_TYPE_LABEL',
                )}
                name="sellerType"
                value={formData.sellerType}
                onChange={handleChange}
                options={translatedSellerTypeOptions}
              />
              <TextArea
                label={t(
                  'SCREEN.SELLER_REGISTRATION.SELLER_ADDRESS_LOCATION_LABEL',
                )}
                describe={t(
                  'SCREEN.SELLER_REGISTRATION.SELLER_ADDRESS_LOCATION_PLACEHOLDER',
                )}
                name="sellerAddress"
                value={formData.sellerAddress}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <FileInput
                label={t('SHARED.PHOTO.MISC_LABELS.SELLER_IMAGE_LABEL')}
                imageUrl={previewImage}
                handleAddImage={handleAddImage}
              />
            </div>
            <div className="mb-4 mt-3 ml-auto w-min">
              <Button
                label={t('SHARED.SAVE')}
                disabled={!isSaveEnabled}
                styles={{
                  color: '#ffc153',
                  height: '40px',
                  padding: '10px 15px',
                }}
                onClick={handleSave}
              />
            </div>
          </ToggleCollapse>

          {/* seller review toggle */}
          <ToggleCollapse
            header={t('SCREEN.SELLER_REGISTRATION.REVIEWS_SUMMARY_LABEL')}
            open={false}>
            <TrustMeter
              ratings={
                dbUserSettings
                  ? dbUserSettings.trust_meter_rating
                  : placeholderSeller.trust_meter_rating
              }
            />
            <div className="flex items-center justify-between mt-3 mb-5">
              <p className="text-sm">
                {t('SCREEN.BUY_FROM_SELLER.REVIEWS_SCORE_MESSAGE', {
                  seller_review_rating: dbSeller
                    ? dbSeller.average_rating.$numberDecimal
                    : placeholderSeller.average_rating,
                })}
              </p>
              {!isSaveEnabled ? (
                <Link
                  href={
                    dbSeller
                      ? `/seller/reviews/${dbSeller.seller_id}?user_name=${currentUser?.pi_username}`
                      : '#'
                  }>
                  <OutlineBtn
                    disabled={!currentUser}
                    label={t('SHARED.CHECK_REVIEWS')}
                  />
                </Link>
              ) : (
                <OutlineBtn
                  disabled={!currentUser}
                  label={t('SHARED.CHECK_REVIEWS')}
                  onClick={() =>
                    handleNavigation(
                      dbSeller
                        ? `/seller/reviews/${dbSeller.seller_id}?user_name=${currentUser?.pi_username}`
                        : '#',
                    )
                  }
                />
              )}
            </div>
          </ToggleCollapse>

          {/* contact details info toggle */}
          <ToggleCollapse
            header={t('SCREEN.BUY_FROM_SELLER.SELLER_CONTACT_DETAILS_LABEL')}
            open={false}>
            <div className="text-sm mb-3">
              <span className="font-bold">
                {t('SHARED.USER_INFORMATION.PI_USERNAME_LABEL') + ': '}
              </span>
              <span>{currentUser ? currentUser.pi_username : ''}</span>
            </div>
            <div className="text-sm mb-3">
              <span className="font-bold">
                {t('SHARED.USER_INFORMATION.NAME_LABEL') + ': '}
              </span>
              <span>
                {dbUserSettings
                  ? dbUserSettings.user_name
                  : currentUser?.user_name}
              </span>
            </div>
            <div className="mb-4">
              <TelephoneInput
                label={t('SCREEN.SELLER_REGISTRATION.PHONE_NUMBER_LABEL')}
                value={formData.phone_number}
                name="phone_number"
                onChange={(value: any) =>
                  handleChange({ name: 'phone_number', value })
                }
              />
            </div>
            <div className="mb-4">
              <Input
                label={t('SCREEN.SELLER_REGISTRATION.EMAIL_LABEL')}
                placeholder=""
                type="email"
                name="email"
                value={formData.email ? formData.email : ''}
                onChange={handleChange}
              />
            </div>
            <p className="text-gray-400 text-sm -mt-3 mb-5">
              {t('SCREEN.SELLER_REGISTRATION.CONTACT_PUBLIC_NOTE')}
            </p>
            <div className="mb-4 mt-3 ml-auto w-min">
              <Button
                label={t('SHARED.SAVE')}
                disabled={!isSaveEnabled}
                styles={{
                  color: '#ffc153',
                  height: '40px',
                  padding: '10px 15px',
                }}
                onClick={handleSave}
              />
            </div>
          </ToggleCollapse>
        </div>
        <ConfirmDialog
          show={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={setShowConfirmDialog}
          message={t('SHARED.CONFIRM_DIALOG')}
          url={linkUrl}
        />
      </div>
    </>
  );
};

export default SellerRegistrationForm;