import { Request, Response } from "express";

import * as userSettingsService from "../services/userSettings.service";
import { IUserSettings } from "../types";

import logger from "../config/loggingConfig";

export const getUserPreferences = async (req: Request, res: Response) => {
  const { user_settings_id } = req.params;
  try {
    const userPreferences: IUserSettings | null = await userSettingsService.getUserSettingsById(user_settings_id);
    if (!userPreferences) {
      logger.warn(`User Preferences not found for ID: ${user_settings_id}`);
      return res.status(404).json({ message: "User Preferences not found" });
    }
    logger.info(`Fetched User Preferences for ID: ${user_settings_id}`);
    res.status(200).json(userPreferences);
  } catch (error: any) {
    logger.error(`Failed to fetch user preferences for userSettingsID ${ user_settings_id }:`, { 
      message: error.message,
      config: error.config,
      stack: error.stack
    });
    return res.status(500).json({ message: 'An error occurred while getting user preferences; please try again later' });
  }
};

export const fetchUserPreferences = async (req: Request, res: Response) => {
  try {
    const currentUserPreferences = req.currentUserSettings;
    if (!req.currentUser || !currentUserPreferences) {
      logger.warn(`User Preferences not found for user with ID: ${req.currentUser?.pi_uid || "NULL"}`);
      return res.status(404).json({ message: "User Preferences not found" });
    }
    logger.info(`Fetched User Preferences for user with ID: ${req.currentUser.pi_uid}`);
    res.status(200).json(currentUserPreferences);

  } catch (error: any) {
    logger.error(`Failed to fetch user preferences for piUID ${ req.currentUser?.pi_uid }:`, { 
      message: error.message,
      config: error.config,
      stack: error.stack
    });
    return res.status(500).json({ message: 'An error occurred while fetching user preferences; please try again later' });
  }
};

export const addUserPreferences = async (req: Request, res: Response) => {
  try {
    const authUser = req.currentUser
    const formData = req.body;

    if (!authUser) {
      logger.warn("No authenticated user found for user preferences.");
      return res.status(401).json({ message: "Unauthorized user" });
    }

    // image file handling (have to ts-ignore because tsc thinks the file can't have a location property, even though it can and does)
    const file = req.file;
    //@ts-ignore
    const image = file ? file.location : '';

    const userPreferences = await userSettingsService.addOrUpdateUserSettings(authUser, formData, image);
    logger.info(`Added or updated User Preferences for user with ID: ${authUser.pi_uid}`);
    res.status(200).json({ settings: userPreferences });    
  } catch (error: any) {
    logger.error(`Failed to add or update user preferences for piUID ${ req.currentUser?.pi_uid }:`, { 
      message: error.message,
      config: error.config,
      stack: error.stack
    });
    return res.status(500).json({ message: 'An error occurred while adding or updating user preferences; please try again later' });
  }
};

export const deleteUserPreferences = async (req: Request, res: Response) => {
  const { user_settings_id: user_settings_id } = req.params;
  try {
    const deletedUserSettings = await userSettingsService.deleteUserSettings(user_settings_id);
    logger.info(`Deleted user preferences with ID ${user_settings_id}`);
    res.status(200).json({ message: "User Preferences deleted successfully", deletedUserSettings: deletedUserSettings });
  } catch (error: any) {
    logger.error(`Failed to delete user preferences for userSettingsID ${ user_settings_id }:`, { 
      message: error.message,
      config: error.config,
      stack: error.stack
    });
    return res.status(500).json({ message: 'An error occurred while deleting user preferences; please try again later' });
  }
};

export const getUserLocation = async (req: Request, res: Response) => {
  let location: { lat: number; lng: number } | null;
  
  try {
    const authUser = req.currentUser;
    const zoom = 13;
    if (!authUser?.pi_uid) {
      logger.warn(`User not authenticated`);
      return res.status(401).json({ message: "User not authenticated" });      
    }

    location = await userSettingsService.userLocation(authUser.pi_uid);
    if (!location) {
      logger.warn(`User location not found for piUID: ${authUser.pi_uid}`);
      return res.status(404).json({ message: "User location not found for piUID: " + authUser.pi_uid });      
    }
    logger.info('User location from backend:', location)
    return res.status(200).json({ origin: location, zoom: zoom });

  } catch (error: any) {
    logger.error(`Failed to get user location for piUID ${ req.currentUser?.pi_uid }:`, {
      message: error.message,
      config: error.config,
      stack: error.stack
    });
    return res.status(500).json({ message: 'An error occurred while getting user location; please try again later' });
  }
};
