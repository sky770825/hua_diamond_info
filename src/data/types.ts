export interface PortfolioItem {
  id: string;
  title?: string;
  description?: string;
  image: string;
}

export interface MemberContact {
  line?: string;
  email?: string;
  phone?: string;
}

export interface Member {
  no: string;
  name: string;
  /** 形象照片路徑，例如 /uploads/xxx.jpg */
  avatar?: string;
  /** 聯絡方式，供詳情頁 CTA 使用 */
  contact?: MemberContact;
  tags: string[];
  needs: { general: string; ideal: string; dream: string };
  services: string[];
  portfolio?: PortfolioItem[];
}
