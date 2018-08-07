CREATE TABLE `users` (
  `user` varchar(100) NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `follows` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` varchar(100) DEFAULT NULL,
  `courseId` varchar(50) DEFAULT NULL,
  `STT` varchar(50) DEFAULT NULL,
  `yearId` varchar(8) DEFAULT NULL,
  `semester` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

CREATE TABLE `files` (
  `fileId` int(11) NOT NULL AUTO_INCREMENT,
  `courseId` varchar(50) DEFAULT NULL,
  `STT` varchar(50) DEFAULT NULL,
  `semesterId` varchar(1) DEFAULT NULL,
  `yearId` varchar(8) DEFAULT NULL,
  `path` varchar(200) NOT NULL,
  PRIMARY KEY (`fileId`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

CREATE TABLE `courses` (
  `courseName` varchar(100) DEFAULT NULL,
  `courseId` varchar(50) NOT NULL,
  PRIMARY KEY (`courseId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `semester` (
  `id` varchar(1) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `years` (
  `id` varchar(8) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

