import {
  SideBarDataInterFace,
  UserMenuDataInterFace,
  sideBarDataType,
} from "@/layout/LayoutTypes";
import { Href } from "../../utils/constant/index";
import LoadingLoader from "@/layout/LoadingLoader";
import Style1Skelton from "@/layout/Skelton/Style1Skelton";
import Style3Skelton from "@/layout/Skelton/Style3Skelton";
import Style4Skelton from "@/layout/Skelton/Style4Skelton";
import Style6Skelton from "@/layout/Skelton/Style6Skelton";
import Style7Skelton from "@/layout/Skelton/Style7Skelton";
import Style8Skelton from "@/layout/Skelton/Style8Skelton";
import Style9Skelton from "@/layout/Skelton/Style9Skelton";
import Style10Skelton from "@/layout/Skelton/Style10Skelton";
import Style11Skelton from "@/layout/Skelton/Style11Skelton";
import Style12Skelton from "@/layout/Skelton/Style12Skelton";
import FavoriteHomePage from "@/layout/Skelton/FavoriteHomePage";
import FavoriteAboutPage from "@/layout/Skelton/FavoriteAboutPage";
import FavoriteReviews from "@/layout/Skelton/FavoriteReviews";
import FavoriteGallery from "@/layout/Skelton/FavoriteGallery";
import MusicSkelton from "@/layout/Skelton/MusicSkelton";
import WeatherSkelton from "@/layout/Skelton/WeatherSkelton";
import EventSkelton from "@/layout/Skelton/EventSkelton";
import BirthDaySkelton from "@/layout/Skelton/BirthDaySkelton";
import GameSkelton from "@/layout/Skelton/GameSkelton";
import ProfileTimeLine from "@/layout/Skelton/ProfileTimeLine";
import AboutProfileSkelton from "@/layout/Skelton/AboutProfileSkelton";
import ProfileFriendSkelton from "@/layout/Skelton/ProfileFriendSkelton";
import ProfileGallery from "@/layout/Skelton/profileGallery";
import ActivityFeedProfileSkelton from "@/layout/Skelton/ActivityFeedProfileSkelton";
import PageList from "@/layout/Skelton/PageList";

export const userMessageData = [
  { status: "active", name: "Paige Turner", message: "bạn có ở đây không ?" },
  { name: "Bob Frapples", message: "bạn có ở đây không ?" },
  { status: "offline", name: "Paige Turner", message: "xin chào ! bạn thế nào ?" },
];

export const notificationList = [
  {
    image: 6,
    name: "Bob Frapples",
    message: "đã thêm câu chuyện của họ",
    time: "8 giờ trước",
  },
  {
    image: 7,
    name: "Josephin water",
    message: "có sinh nhật hôm nay",
    time: "sun at 5.55 AM",
  },
  {
    image: 2,
    name: "Petey Cruiser",
    message: "đã thêm một bức ảnh mới",
    time: "sun at 5.40 AM",
  },
];

export const userMenuData: UserMenuDataInterFace[] = [
  {
    navigate: "/profile/timeline",
    icon: "User",
    heading: "trang cá nhân",
    headingDetail: "trang cá nhân và cài đặt",
  },
  {
    navigate: "/settings",
    icon: "Settings",
    heading: "cài đặt và quyền riêng tư",
    headingDetail: "tất cả cài đặt và quyền riêng tư",
  },
  {
    navigate: "/helpandsupport",
    icon: "HelpCircle",
    heading: "hỗ trợ và trợ giúp",
    headingDetail: "tìm kiếm hỗ trợ ở đây",
  },
];



export const sideBarData: sideBarDataType[] = [
  { path: "/newsfeed/style1", icon: "File", tooltipTittle: "newsfeed" },
  { path: "/favourite/home", icon: "Star", tooltipTittle: "Favourite" },
  { path: Href, icon: "User", tooltipTittle: "Groups" },
  { path: "/music", icon: "Headphones", tooltipTittle: "Music" },
  { path: "/weather", icon: "Cloud", tooltipTittle: "Weather" },
  { path: "/event", icon: "Calendar", tooltipTittle: "Event" },
];

export const smallSideBarData: SideBarDataInterFace[] = [
  { title: "newsfeed", icon: "File" },
  { title: "music & video", icon: "Headphones" },
  { title: "weather", icon: "Cloud" },
  { title: "calender", icon: "Calendar" },
];
export const newsFeedLayoutData = [
  { title: "style 1", navigate: "/newsfeed/style1" },
  { title: "style 2", navigate: "/newsfeed/style2" },
];

export const profilePagesData = [
  { title: "timeline", navigate: "/profile/timeline" },
  { title: "about", navigate: "/profile/about" },
  { title: "friends", navigate: "/profile/friends" },
  { title: "gallery", navigate: "/profile/gallery" },
  { title: "Acitivity Feed", navigate: "/profile/acitivityfeed" },
  { title: "tab", navigate: "/profile/profiletab" },
  { title: "friend profile", navigate: "/profile/friend" },
];
export const favouritePagesData = [
  { title: "Page Listing", navigate: "/pagelist" },
  { title: "Page Home", navigate: "/favourite/home" },
  { title: "About", navigate: "/favourite/about" },
  { title: "Review", navigate: "/favourite/reviews" },
  { title: "Gallery", navigate: "/favourite/photos" },
  { title: "Tab", navigate: "/favourite/tab" },
];
export const otherPagesData = [
  { diffrentImage: "events", title: "Event & Calender", navigate: "/event" },
  { diffrentImage: "birthday", title: "Birthday", navigate: "/birthday" },
  { diffrentImage: "weather", title: "Weather", navigate: "/weather" },
  { diffrentImage: "music", title: "Music", navigate: "/music" },
  { diffrentImage: "events", title: "Games", navigate: "/games" },
  { diffrentImage: "login", title: "Login", navigate: "/auth/login" },
  { diffrentImage: "register", title: "Register", navigate: "/auth/register" },
  {
    diffrentImage: "help",
    title: "Help & Support",
    navigate: "/helpandsupport",
  },
  { diffrentImage: "messanger", title: "Messenger", navigate: "/messanger" },
  { diffrentImage: "setting", title: "Setting", navigate: "/settings" },
  { diffrentImage: "help", title: "help Article", navigate: "/helparticle" },
];
export const companyPagesData = [
  { diffrentImage: "home", title: "Home", navigate: "/company/home" },
  { diffrentImage: "about", title: "About", navigate: "/company/about" },
  { diffrentImage: "blog", title: "Blog", navigate: "/company/blog" },
  {
    diffrentImage: "blog-details",
    title: "Blog Details",
    navigate: "/company/blog-details",
  },
  { diffrentImage: "faq", title: "Faq", navigate: "/company/faq" },
  { diffrentImage: "career", title: "Career", navigate: "/company/careers" },
  {
    diffrentImage: "career-details",
    title: "Career Details",
    navigate: "/company/careers-details",
  },
  {
    diffrentImage: "coming-soon",
    title: "Coming soon",
    navigate: "/company/comingsoon",
  },
  { diffrentImage: "404", title: "404", navigate: "/company/404" },
];
export const elementPagesData = [
  {
    diffrentImage: "typography",
    title: "typography",
    navigate: "/element/typography",
  },
  {
    diffrentImage: "widget",
    title: "SideBar widgets",
    navigate: "/element/widget",
  },
  {
    diffrentImage: "calendar",
    title: "calendar",
    navigate: "/element/calender",
  },
  { diffrentImage: "map", title: "maps", navigate: "/element/map" },
  { diffrentImage: "icons", title: "icons", navigate: "/element/icons" },
  { diffrentImage: "modal", title: "modal", navigate: "/element/modal" },
  { diffrentImage: "buttons", title: "buttons", navigate: "/element/buttons" },
];

export const closeFriendsData = [
  { id: 1, name: "Paige Turner", image: "1", message: ["demo1"] },
  { id: 2, name: "Bob Frapples", image: "2", message: ["demo2"] },
];

export const recentChatsData = [
  { id: 3, name: "Josephin Water", image: "3", message: ["demo1"] },
  { id: 4, name: "Petey Cruiser", image: "4", message: ["demo2"] },
  { id: 5, name: "Anna Sthesia", image: "5", message: ["demo2"] },
  { id: 6, name: "Paul Molive", image: "6", message: ["demo2"] },
  { id: 7, name: "Anna Mull", image: "7", message: ["demo2"] },
];

export const profileUserData = [
  { value: "546", title: "following" },
  { value: "26335", title: "likes" },
  { value: "6845", title: "followers" },
];

interface dataInterFace {
  name: string;
  navigate: string;
  icon: "Clock" | "Info" | "Users" | "Image" | "List";
}
export const profileMenuData: dataInterFace[] = [
  { navigate: "/profile/timeline", name: "bảng tin", icon: "Clock" },
  { navigate: "/profile/about", name: "giới thiệu", icon: "Info" },
  { navigate: "/profile/friends", name: "bạn bè", icon: "Users" },
  { navigate: "/profile/gallery", name: "ảnh", icon: "Image" },
  { navigate: "/profile/acitivityfeed", name: "hoạt động", icon: "List" },
];

export const layoutFooterData = [
  {
    mainTittle: "my account",
    children: [
      { link: "/profile/timeline", title: "timeline" },
      { link: "/profile/about", title: "about" },
      { link: "/profile/friends", title: "friends" },
      { link: "/profile/gallery", title: "gallery" },
      { title: "settings" },
    ],
  },
  {
    mainTittle: "quick links",
    children: [
      { title: "settings" },
      { link: "/helpandsupport", title: "help & support" },
      { link: "/messanger", title: "messanger" },
      { link: "/favourite/home", title: "pages" },
      { link: "/company/about", title: "company" },
    ],
  },
  {
    mainTittle: "pages",
    children: [
      { link: "/event", title: "event" },
      { link: "/birthday", title: "birthday" },
      { link: "/weather", title: "weather" },
      { link: "/music", title: "music" },
      { link: "/auth/register", title: "register" },
    ],
  },
  {
    mainTittle: "company",
    children: [
      { link: "/company/about", title: "about us" },
      { link: "/company/blog", title: "blog" },
      { title: "contact us" },
      { link: "/company/faq", title: "faq" },
      { link: "/company/careers", title: "careers" },
    ],
  },
];

export const companyNavBarData = [
  { title: "Home", navigate: "/newsfeed/style1" },
  { title: "about", navigate: "/company/about" },
  { title: "career", navigate: "/company/careers" },
  { title: "blog", navigate: "/company/blog" },
  { title: "FAQ", navigate: "/company/faq" },
];
export const skeltonLoaderList: { [key: string]: React.ReactElement } = {
  defaultLoader: <LoadingLoader />,
  style1: <Style1Skelton />,
  style3: <Style3Skelton />,
  style4: <Style4Skelton />,
  style6: <Style6Skelton />,
  style7: <Style7Skelton />,
  style8: <Style8Skelton />,
  style9: <Style9Skelton />,
  style10: <Style10Skelton />,
  style11: <Style11Skelton />,
  style12: <Style12Skelton />,
  pageList: <PageList />,
  favoriteHomePage: <FavoriteHomePage />,
  favoriteAboutPage: <FavoriteAboutPage />,
  favoriteReviews: <FavoriteReviews />,
  favoriteGallery: <FavoriteGallery />,
  music: <MusicSkelton />,
  weatherSkelton: <WeatherSkelton />,
  eventSkelton: <EventSkelton />,
  birthDayLoader: <BirthDaySkelton />,
  gameSkelton: <GameSkelton />,
  profileTimeLine: <ProfileTimeLine />,
  aboutProfileSkelton: <AboutProfileSkelton />,
  profileFriend: <ProfileFriendSkelton />,
  profileGallery: <ProfileGallery />,
  activityFeedProfile: <ActivityFeedProfileSkelton />,
};
