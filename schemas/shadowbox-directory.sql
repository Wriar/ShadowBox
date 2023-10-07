-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: LA2-Dc2-PROD-DB-01.internal
-- Generation Time: Oct 07, 2023 at 09:51 PM
-- Server version: 10.3.38-MariaDB-0ubuntu0.20.04.1
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sb_files`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_directory`
--

CREATE TABLE `admin_directory` (
  `dirID` varchar(255) NOT NULL COMMENT 'UUIDv4 of the directory reference.',
  `directoryFullPath` text NOT NULL COMMENT 'Encrypted directory of the path, including itself.',
  `createdAt` text NOT NULL COMMENT 'Encrypted ISO datetime when the directory was created.',
  `depthHint` int(11) NOT NULL COMMENT 'Plain depth of the directory to prioritize in introspection (0=root)',
  `meta` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for table `admin_directory`
--
ALTER TABLE `admin_directory`
  ADD PRIMARY KEY (`dirID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
