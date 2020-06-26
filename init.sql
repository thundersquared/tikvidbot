USE tikvidbot;

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(100) NOT NULL,
  `session` longtext NOT NULL,
  PRIMARY KEY (`id`));

