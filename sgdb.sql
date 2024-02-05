-- phpMyAdmin SQL Dump
-- version 4.3.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: 2024-02-05 06:12:05
-- 服务器版本： 5.6.21-log
-- PHP Version: 5.3.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `sgdb`
--

-- --------------------------------------------------------

--
-- 表的结构 `card`
--

CREATE TABLE IF NOT EXISTS `card` (
`uid` int(11) NOT NULL,
  `user` int(4) NOT NULL,
  `cardtype` int(4) NOT NULL,
  `info` varchar(255) NOT NULL,
  `name` varchar(12) NOT NULL,
  `used` int(4) DEFAULT '0'
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;

--
-- 转存表中的数据 `card`
--

INSERT INTO `card` (`uid`, `user`, `cardtype`, `info`, `name`, `used`) VALUES
(1, 5, 1, '{"force":2,"selectedCards":[10204,10208,21003,10209,30101,10203,21004,21009,21002,10202,10207,20202,10205,10208,10208,10207,21007,21007,10208,10206,10205,21006,10207,20203,21015,21010,21009,21010,10202,10206],"currentCards":[],"cardPool":[]}', '5竞技', 0),
(2, 7, 1, '{"force":4,"selectedCards":[20402,20402,21008,10410,20405,30001,30101,20401,30004,20404,10401,30105,10401,10410,10402,10405,21005,21008,21006,30004,30001,10402,21010,10410,30106,30107,10408,21002,10402,30101],"currentCards":[],"cardPool":[]}', '7竞技', 0),
(3, 4, 1, '{"force":2,"selectedCards":[10209,10201,20204,21011,10209,21011,10202,21003,21005,10210,10206,10202,10207,10207,20204,10205,21002,21001,21008,20201,21011,21006,10203,10201,10203,30101,21009,10206,10201,21002],"currentCards":[],"cardPool":[]}', '4竞技', 0),
(4, 1, 1, '{"force":3,"selectedCards":[21006,10307,10310,21004,21004,20302,10307,30001,21011,21007,21007,10304,21006,30108,10303,30004,10305,10303,20303,20303,30109,30102,21002,10305,20305,10302,21008,30001,10304,30101],"currentCards":[],"cardPool":[]}', '1竞技', 0),
(5, 8, 1, '{"force":4,"selectedCards":[20402,21015,21013,20404,21006,30107,20401,30109,20404,21002,21015,21004,10402,20401,20404,10406,10403,30001,10410,10408,21008,20404,30004,10402,21011,10410,21007,30106,21004,30101],"currentCards":[],"cardPool":[]}', '8竞技', 0),
(8, 1, 2, '{"force":4,"selectedCards":[20402,20402,20401,20401,10408,10408,10404,10404,10407,10407,10406,10406,10405,10405,10409,10410,20405,20404,20404,20403,20403,10402,10402,21014,21012,21003,30001,30001,21015,21015]}', '测试盗贼卡组改名', 0),
(11, 1, 2, '{"force":1,"selectedCards":[21012,21003,21014,21011,21011,21015,21015,30001,30001,30109,30108,30110,30107,30107,20105,20104,20104,20103,20103,10110,10109,10108,10108,10107,10107,10106,10106,10105,10105,10102]}', '测试黄巾', 1);

-- --------------------------------------------------------

--
-- 表的结构 `user`
--

CREATE TABLE IF NOT EXISTS `user` (
`uid` int(4) NOT NULL,
  `account` varchar(32) NOT NULL,
  `password` varchar(32) NOT NULL,
  `nick` varchar(32) DEFAULT NULL,
  `ctime` datetime NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;

--
-- 转存表中的数据 `user`
--

INSERT INTO `user` (`uid`, `account`, `password`, `nick`, `ctime`) VALUES
(1, 'test1', '111', '测试1', '2024-01-26 15:43:35'),
(4, '111', '111', '月月', '2024-01-26 16:36:32'),
(5, '222', '222', '白云', '2024-01-26 16:37:47'),
(7, '333', '333', '小太阳', '2024-01-26 16:38:08'),
(8, 'test2', '111', '测试2', '2024-01-26 16:50:38');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `card`
--
ALTER TABLE `card`
 ADD PRIMARY KEY (`uid`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
 ADD PRIMARY KEY (`uid`), ADD UNIQUE KEY `account` (`account`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `card`
--
ALTER TABLE `card`
MODIFY `uid` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=12;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
MODIFY `uid` int(4) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=9;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
