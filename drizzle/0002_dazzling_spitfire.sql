CREATE TABLE `analyticsEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`anonymousInstallHash` varchar(64) NOT NULL,
	`eventName` varchar(48) NOT NULL,
	`dateKey` varchar(10) NOT NULL,
	`surface` varchar(48),
	`contentId` varchar(160),
	`countryCode` varchar(2),
	`platform` varchar(16),
	`properties` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyticsEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `analytics_date_idx` ON `analyticsEvents` (`dateKey`);--> statement-breakpoint
CREATE INDEX `analytics_event_idx` ON `analyticsEvents` (`eventName`);--> statement-breakpoint
CREATE INDEX `analytics_country_idx` ON `analyticsEvents` (`countryCode`);