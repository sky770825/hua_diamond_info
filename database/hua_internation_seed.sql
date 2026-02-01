-- ============================================================
-- Seed: hua_internation 初始資料
-- 對應 backend/data/members.json
-- ============================================================

SET search_path TO hua_internation;

-- 清空（可選，部署時視情況註解）
-- TRUNCATE hua_internation.portfolio_items CASCADE;
-- TRUNCATE hua_internation.member_contacts CASCADE;
-- TRUNCATE hua_internation.members CASCADE;

-- ------------------------------------------------------------
-- Members
-- ------------------------------------------------------------
INSERT INTO hua_internation.members (no, name, avatar, tags, needs_general, needs_ideal, needs_dream, services)
VALUES
  (
    '016',
    '蔡濬瑒',
    '/uploads/59f0550d-2095-4bbd-89f1-7e83327c94cf.png',
    ARRAY['房屋買賣','資源整合','LINE OA','網站','行銷'],
    '社宅、包租代管業者；里長／社區總幹事',
    '社宅、包租代管業者；服務區域直買／直賣',
    '楊梅區可做專任委賣的物件',
    ARRAY['成交實戰節奏與話術支援','店家互惠引流與曝光合作','官方帳號導流與內容投放規劃']
  ),
  (
    '080',
    '游曉瑄 Charming',
    NULL,
    ARRAY['廣告投放','廣告健檢','行銷策略','數據分析','企業內訓'],
    '想知道廣告投去哪？年度廣告健檢',
    '廣告規劃、廣告優化服務',
    '企業內訓 x 顧問諮詢（達成業績目標）',
    ARRAY['Meta 廣告投放與優化','行銷策略與數據分析顧問','企業內訓：廣告與行銷團隊能力提升']
  ),
  (
    '100',
    '廖宜勤 Daniel',
    NULL,
    ARRAY['影像製作','現場直播','多機位','活動紀錄'],
    '中小企／協會／學會需要錄影或直播',
    '教育訓練、論壇、研討會長期影音合作',
    '品牌總部長期合作影音製作夥伴',
    ARRAY['多機位直播與現場技術支援','活動錄影剪輯與回顧影片','一條龍：拍攝、剪輯、交付']
  )
ON CONFLICT (no) DO UPDATE SET
  name = EXCLUDED.name,
  avatar = EXCLUDED.avatar,
  tags = EXCLUDED.tags,
  needs_general = EXCLUDED.needs_general,
  needs_ideal = EXCLUDED.needs_ideal,
  needs_dream = EXCLUDED.needs_dream,
  services = EXCLUDED.services,
  updated_at = NOW();

-- ------------------------------------------------------------
-- Member Contacts
-- ------------------------------------------------------------
INSERT INTO hua_internation.member_contacts (member_no, line, email, phone)
VALUES
  ('016', 'https://line.me/ti/p/example-016', NULL, NULL),
  ('080', NULL, 'charming@example.com', NULL),
  ('100', NULL, NULL, '0912345678')
ON CONFLICT (member_no) DO UPDATE SET
  line = EXCLUDED.line,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone;
