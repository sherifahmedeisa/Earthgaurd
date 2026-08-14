-- Sync volunteers data from updated CSV
-- This script updates hall assignments and removes volunteers not in the new list

-- First, let's identify which volunteer codes are in the new list
-- We'll update volunteers with new hall assignments

-- Update volunteers with new/changed hall assignments
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0083';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1715';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1747';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0181';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1463';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0251';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1680';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0359';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0462';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0565';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0612';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0620';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0621';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0857';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1048';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1196';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1329';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1395';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 1722';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 1713';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 1721';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0051';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0117';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0123';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0124';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0135';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0161';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0174';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0203';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0205';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0654';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0589';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0634';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 1226';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0721';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 1032';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1052';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1138';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1162';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1205';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1231';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1245';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1262';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1294';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1325';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1352';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1371';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1387';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1389';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1474';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1503';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1532';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1746';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1454';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1734';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1753';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0492';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1573';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1639';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1676';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1687';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1749';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1706';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1727';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0178';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0914';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0922';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1228';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1326';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1472';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1663';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1708';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0211';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1480';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1397';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1661';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0238';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0515';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1750';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1737';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1169';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1238';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0413';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1624';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1683';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0323';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0856';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0407';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0610';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0617';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0863';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 1435';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 1482';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 1599';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 1724';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0201';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0302';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0373';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0767';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 1092';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1197';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1202';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0551';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1087';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1088';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1417';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1690';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0822';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0360';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1082';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1076';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0614';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1105';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0826';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0504';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1324';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1605';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0131';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0450';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0456';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0670';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1086';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0195';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0295';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1156';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1711';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0834';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0957';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1286';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1441';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1192';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1689';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0473';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0554';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1630';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0954';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0164';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0915';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0114';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1034';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1055';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1259';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1493';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0065';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0541';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0681';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 1504';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 1714';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0421';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 1461';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 1418';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0043';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 1050';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 1112';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0336';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0277';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0745';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0973';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 1557';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0090';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0317';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 1743';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1667';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0468';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0029';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0112';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0118';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0151';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0184';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0257';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0403';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0410';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0461';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0464';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0478';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0484';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0503';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1428';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1752';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1517';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1589';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0512';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0526';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0548';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0683';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0686';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0691';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0708';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0738';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0794';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0835';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0877';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0895';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0956';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1044';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1150';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1157';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1180';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1246';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1248';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1354';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1364';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1370';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1607';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1613';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1670';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1367';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1303';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1742';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0453';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0019';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1693';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1029';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 1583';
UPDATE volunteers SET hall_number = 'Hall 1' WHERE volunteer_code = 'O- 0069';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 1091';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 1314';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 1538';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0005';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0087';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0187';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0208';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0222';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0265';
UPDATE volunteers SET hall_number = 'Hall 2' WHERE volunteer_code = 'O- 0480';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0482';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0653';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0807';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0837';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0906';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0969';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1021';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1053';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1068';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1101';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0669';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 0695';
UPDATE volunteers SET hall_number = 'Hall 3' WHERE volunteer_code = 'O- 1131';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0532';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1741';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1134';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0697';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1430';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1560';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0802';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 0813';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1285';
UPDATE volunteers SET hall_number = 'Hall 4' WHERE volunteer_code = 'O- 1268';

-- Delete volunteers not in the new list
DELETE FROM volunteers WHERE volunteer_code NOT IN (
  'O- 0083', 'O- 1715', 'O- 1747', 'O- 0181', 'O- 1463', 'O- 0251', 'O- 1680', 'O- 0359', 'O- 0462', 'O- 0565',
  'O- 0612', 'O- 0620', 'O- 0621', 'O- 0857', 'O- 1048', 'O- 1196', 'O- 1329', 'O- 1395', 'O- 1722', 'O- 1713',
  'O- 1721', 'O- 0051', 'O- 0117', 'O- 0123', 'O- 0124', 'O- 0135', 'O- 0161', 'O- 0174', 'O- 0203', 'O- 0205',
  'O- 0654', 'O- 0589', 'O- 0634', 'O- 1226', 'O- 0721', 'O- 1032', 'O- 1052', 'O- 1138', 'O- 1162', 'O- 1205',
  'O- 1231', 'O- 1245', 'O- 1262', 'O- 1294', 'O- 1325', 'O- 1352', 'O- 1371', 'O- 1387', 'O- 1389', 'O- 1474',
  'O- 1503', 'O- 1532', 'O- 1746', 'O- 1454', 'O- 1734', 'O- 1753', 'O- 0492', 'O- 1573', 'O- 1639', 'O- 1676',
  'O- 1687', 'O- 1749', 'O- 1706', 'O- 1727', 'O- 0178', 'O- 0914', 'O- 0922', 'O- 1228', 'O- 1326', 'O- 1472',
  'O- 1663', 'O- 1708', 'O- 0211', 'O- 1480', 'O- 1397', 'O- 1661', 'O- 0238', 'O- 0515', 'O- 1750', 'O- 1737',
  'O- 1169', 'O- 1238', 'O- 0413', 'O- 1624', 'O- 1683', 'O- 0323', 'O- 0856', 'O- 0407', 'O- 0610', 'O- 0617',
  'O- 0863', 'O- 1435', 'O- 1482', 'O- 1599', 'O- 1724', 'O- 0201', 'O- 0302', 'O- 0373', 'O- 0767', 'O- 1092',
  'O- 1197', 'O- 1202', 'O- 0551', 'O- 1087', 'O- 1088', 'O- 1417', 'O- 1690', 'O- 0822', 'O- 0360', 'O- 1082',
  'O- 1076', 'O- 0614', 'O- 1105', 'O- 0826', 'O- 0504', 'O- 1324', 'O- 1605', 'O- 0131', 'O- 0450', 'O- 0456',
  'O- 0670', 'O- 1086', 'O- 0195', 'O- 0295', 'O- 1156', 'O- 1711', 'O- 0834', 'O- 0957', 'O- 1286', 'O- 1441',
  'O- 1192', 'O- 1689', 'O- 0473', 'O- 0554', 'O- 1630', 'O- 0954', 'O- 0164', 'O- 0915', 'O- 0114', 'O- 1034',
  'O- 1055', 'O- 1259', 'O- 1493', 'O- 0065', 'O- 0541', 'O- 0681', 'O- 1504', 'O- 1714', 'O- 0421', 'O- 1461',
  'O- 1418', 'O- 0043', 'O- 1050', 'O- 1112', 'O- 0336', 'O- 0277', 'O- 0745', 'O- 0973', 'O- 1557', 'O- 0090',
  'O- 0317', 'O- 1743', 'O- 1667', 'O- 0468', 'O- 0029', 'O- 0112', 'O- 0118', 'O- 0151', 'O- 0184', 'O- 0257',
  'O- 0403', 'O- 0410', 'O- 0461', 'O- 0464', 'O- 0478', 'O- 0484', 'O- 0503', 'O- 1428', 'O- 1752', 'O- 1517',
  'O- 1589', 'O- 0512', 'O- 0526', 'O- 0548', 'O- 0683', 'O- 0686', 'O- 0691', 'O- 0708', 'O- 0738', 'O- 0794',
  'O- 0835', 'O- 0877', 'O- 0895', 'O- 0956', 'O- 1044', 'O- 1150', 'O- 1157', 'O- 1180', 'O- 1246', 'O- 1248',
  'O- 1354', 'O- 1364', 'O- 1370', 'O- 1607', 'O- 1613', 'O- 1670', 'O- 1367', 'O- 1303', 'O- 1742', 'O- 0453',
  'O- 0019', 'O- 1693', 'O- 1029', 'O- 1583', 'O- 0069', 'O- 1091', 'O- 1314', 'O- 1538', 'O- 0005', 'O- 0087',
  'O- 0187', 'O- 0208', 'O- 0222', 'O- 0265', 'O- 0480', 'O- 0482', 'O- 0653', 'O- 0807', 'O- 0837', 'O- 0906',
  'O- 0969', 'O- 1021', 'O- 1053', 'O- 1068', 'O- 1101', 'O- 0669', 'O- 0695', 'O- 1131', 'O- 0532', 'O- 1741',
  'O- 1134', 'O- 0697', 'O- 1430', 'O- 1560', 'O- 0802', 'O- 0813', 'O- 1285', 'O- 1268'
);
