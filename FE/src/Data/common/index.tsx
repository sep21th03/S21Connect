import {
  CreatePostInterface,
  GalleryModalInterFace,
  galleryDropDownsInterFace,
  userDropDownDataInterFace,
} from "@/Common/CommonInterFace";
import { EdiPost, HidePost, SavePost } from "../../utils/constant";

// export const createPostDropDown: CreatePostInterface[] = [
//   { icon: "Globe", name: "Public" },
//   { icon: "Users", name: "Friends" },
//   { icon: "User", name: "friends except" },
//   { icon: "User", name: "specific friends" },
//   { icon: "User", name: "only me" },
// ];
export const createPostDropDown: CreatePostInterface[] = [
  { icon: "Globe", name: "Công khai", slug: "public" },
  { icon: "Users", name: "Bạn bè", slug: "friends" },
  { icon: "Lock", name: "Riêng tư", slug: "private" },
];

export const userDropDownData: userDropDownDataInterFace[] = [
  { icon: "Globe", detail: "Public" },
  { icon: "Users", detail: "Friends" },
  { icon: "User", detail: "Friend except" },
  { icon: "User", detail: "specific except" },
  { icon: "Lock", detail: "specific except" },
];

interface createPostInterFace {
  icon: "Camera" | "MapPin" | "Tag";
  tittle: string;
  value: string;
}
export const createPostData: createPostInterFace[] = [
  { icon: "Camera", tittle: "Cảm xúc & hoạt động", value: "feeling" },
  { icon: "MapPin", tittle: "Địa điểm", value: "place" },
  { icon: "Tag", tittle: "Gắn thẻ", value: "friends" },
];

export const feelings = [
  "Happy",
  "Sad",
  "Angry",
  "Worried",
  "Shy",
  "Excited",
  "Surprised",
  "Silly",
  "Embarrassed",
];

export const friendsNames = [
  "Paige Turner",
  "Bob Frapples",
  "Josephin water",
  "Petey Cruiser",
  "Anna Sthesia",
  "Paul Molive",
  "Anna Mull",
];

export const galleryModalDropDownData: GalleryModalInterFace[] = [
  { title: SavePost, icon: "Bookmark" },
  { title: EdiPost, icon: "Edit" },
  { title: HidePost, icon: "XSquare" },
];

export const albumListData = [
  { tittle: "Cover Photos", image: 3 },
  { tittle: "Profile Photos", image: 4 },
  { tittle: "Family Trip", image: 10 },
  { tittle: "Family Trip", image: 11 },
  { tittle: "Family Trip", image: 8 },
  { tittle: "Family Trip", image: 7 },
];

export const galleryDropDowns: galleryDropDownsInterFace[] = [
  { icon: "Trash2", title: "Delete Photo" },
  { icon: "Download", title: "Download" },
  { icon: "Image", title: "Make a cover" },
  { icon: "Image", title: "Make a profile" },
];
export const yearsWiseDetails = [
  { year: 2019, amount: 12 },
  { year: 2018, amount: 12 },
  { year: 2017, amount: 12 },
  { year: 2016, amount: 12 },
  { year: 2015, amount: 12 },
];

export const fullSideBarData = [
  { iconName: "news", title: "newsfeed" },
  { iconName: "star", title: "favourite" },
  { iconName: "friends", title: "group" },
  { iconName: "headphones", title: "music & video" },
  { iconName: "sky", title: "weather" },
  { iconName: "calendar", title: "calender" },
  { iconName: "cake-pop", title: "events" },
  { iconName: "games", title: "games" },
  { iconName: "comment", title: "news" },
  { iconName: "youtube", title: "live streams" },
  { iconName: "cart", title: "shop" },
];

export const spaySideBarData = [
  { iconName: "home-1", title: "Trang chủ", link: "/spay/home" },
  { iconName: "wallet-2", title: "Ví", link: "/spay/wallet" },
  { iconName: "bill", title: "Hóa đơn", link: "/spay/bill" },
  { iconName: "wallet-2", title: "Shop", link: "/spay/shop" },
  { iconName: "transactions", title: "Rút tiền", link: "/spay/disbursement" },
  { iconName: "history", title: "Lịch sử", link: "/spay/history" },
  { iconName: "setting", title: "Cài đặt", link: "/spay/settings" },
];

export const adminSideBarData = [
  { iconName: "friends", title: "Người dùng", link: "/admin/users" },
  { iconName: "post", title: "Bài viết", link: "/admin/posts" },
  { iconName: "transactions", title: "Giao dịch", link: "/admin/transactions" },
  { iconName: "reports", title: "Báo cáo vi phạm", link: "/admin/reports" },
  { iconName: "comment", title: "Hỗ trợ", link: "/admin/support" },
  { iconName: "policy", title: "Chính sách", link: "/admin/policy" },
  { iconName: "notifications", title: "Thông báo", link: "/admin/notifications" },
];

export const reactions = [
  { tittle: "smile", imageName: "040" },
  { tittle: "love", imageName: 113 },
  { tittle: "cry", imageName: "027" },
  { tittle: "wow", imageName: "052" },
  { tittle: "angry", imageName: "039" },
  { tittle: "haha", imageName: "042" },
];


export const feelingMap: Record<string, { emoji: string; title: string }> = {
  Happy: {
    emoji:
      "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f970.png",
    title: "Hạnh phúc",
  },
  Sad: {
    emoji:
      "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f61e.png",
    title: "Buồn",
  },
  Angry: {
    emoji:
      "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f621.png",
    title: "Tức giận",
  },
  Worried: {
    emoji:
      "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f616.png",
    title: "Lo lắng",
  },
  Shy: {
    emoji:
      "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f631.png",
    title: "Ngại ngùng",
  },
  Excited: {
    emoji:
      "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f606.png",
    title: "Phấn khích",
  },
  Surprised: {
    emoji:
      "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f632.png",
    title: "Ngạc nhiên",
  },
  Silly: {
    emoji:
      "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f974.png",
    title: "Ngớ ngẩn",
  },
  Embarrassed: {
    emoji:
      "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1fae3.png",
    title: "Xấu hổ",
  },
};