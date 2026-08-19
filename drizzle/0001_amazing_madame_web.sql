CREATE TABLE `ownerControlAudit` (
	`id` int AUTO_INCREMENT NOT NULL,
	`action` varchar(64) NOT NULL,
	`configKey` varchar(80) NOT NULL,
	`actorOpenId` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ownerControlAudit_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ownerControlConfig` (
	`key` varchar(80) NOT NULL,
	`value` text NOT NULL,
	`scope` enum('public','private') NOT NULL DEFAULT 'public',
	`updatedByOpenId` varchar(64),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ownerControlConfig_key` PRIMARY KEY(`key`)
);
