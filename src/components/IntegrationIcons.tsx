import KalibrrIcon from "@/assets/svg/Kalibrr.svg?react";
import JobStreetIcon from "@/assets/svg/JobStreet.svg?react";
import LokerIdIcon from "@/assets/svg/LokerId.svg?react";
import GlassDoorIcon from "@/assets/svg/GlassDoor.svg?react";
import LinkedInIcon from "@/assets/svg/Linkedin.svg?react";
import IndeedIcon from "@/assets/svg/Indeed.svg?react";
import HiredIcon from "@/assets/svg/Hired.svg?react";
import GlintsIcon from "@/assets/svg/Glints.svg?react";
import WellFoundIcon from "@/assets/svg/WellFound.svg?react";

export const IntegrationIcons = {
  LinkedIn: () => <LinkedInIcon className="w-14 h-14" />,
  Indeed: () => <IndeedIcon className="w-full h-full" />,
  Glints: () => <GlintsIcon className="w-full h-full" />,
  JobStreet: () => <JobStreetIcon className="w-full h-full" />,
  Kalibrr: () => <KalibrrIcon className="w-full h-full" />,
  LokerID: () => <LokerIdIcon className="w-14 h-14" />,
  Toptal: () => (
    <svg viewBox="0 0 54 76" className="w-14 h-14">
      <path
        d="M22.3,49c-0.2,0.1-0.4,0.1-0.7,0c-0.2-0.1-0.4-0.2-0.8-0.6l-4.4-4.4c-0.4-0.4-0.5-0.6-0.6-0.8 c-0.1-0.2-0.1-0.4,0-0.7c0.1-0.2,0.2-0.4,0.6-0.8l14-13.9c0.4-0.4,0.6-0.5,0.8-0.6c0.2-0.1,0.4-0.1,0.7,0c0.2,0.1,0.4,0.2,0.8,0.6 l4.4,4.4c0.4,0.4,0.5,0.6,0.6,0.8c0.1,0.2,0.1,0.4,0,0.7c-0.1,0.2-0.2,0.4-0.6,0.8l-14,13.9C22.7,48.8,22.6,48.9,22.3,49 M53.7,32.8L38.6,17.7c-0.1-0.1-0.3-0.3-0.4-0.4L20.9,0l-7.6,7.6l11.1,11.2L0,43.1l15.1,15.1c0.2,0.2,0.4,0.4,0.6,0.6L32.9,76 l7.5-7.5L29.1,57.3L53.7,32.8z"
        fill="#204ECF"
      />
    </svg>
  ),
  Upwork: () => (
    <svg viewBox="0 0 201 125" className="w-full h-full">
      <path
        d="M153.245 76.2736C147.595 75.959 142.103 74.2925 137.23 71.4141C132.358 68.5357 128.248 64.5298 125.245 59.733C128.867 30.8682 139.408 21.8952 153.354 21.8952C167.299 21.8952 177.894 32.706 177.894 48.9222C177.894 65.1384 167.083 75.9492 153.354 75.9492L153.245 76.2736ZM153.354 3.8411C143.511 3.44229 133.843 6.51523 126.037 12.5227C118.231 18.5302 112.785 27.0901 110.651 36.706C106.024 27.0118 102.523 16.8191 100.218 6.32761H65.7859V49.0303C65.7859 64.5438 58.7589 76.0573 44.975 76.0573C31.1912 76.0573 23.3534 64.5979 23.3534 49.0303V6.32761H3.56963V49.0303C3.12063 60.8638 7.19934 72.4233 14.975 81.3546C18.7704 85.4871 23.4066 88.759 28.572 90.9498C33.7373 93.1411 39.312 94.2006 44.921 94.0573C68.7589 94.0573 85.4616 75.733 85.4616 49.5168V20.6519C89.5097 36.1844 96.2022 50.9039 105.245 64.1655L94.6508 124.598H114.759L121.732 81.7871C124.04 83.7746 126.498 85.5817 129.083 87.1925C135.801 91.4352 143.522 93.8222 151.462 94.1114H153.299C159.205 94.173 165.063 93.0384 170.519 90.7768C175.976 88.5152 180.918 85.173 185.049 80.9509C189.18 76.7292 192.414 71.7152 194.557 66.2109C196.699 60.7065 197.705 54.8254 197.516 48.9222C197.653 43.0404 196.608 37.1909 194.439 31.7214C192.272 26.2519 189.026 21.274 184.897 17.0837C180.767 12.8933 175.837 9.57604 170.399 7.32896C164.962 5.08191 159.129 3.95093 153.245 4.00327"
        fill="#149E00"
      />
    </svg>
  ),
  Freelancer: () => (<svg viewBox="-0.23 0 97.266 72.333" xmlns="http://www.w3.org/2000/svg" width="2500" height="1855"><path d="M56.897 0l6.624 9.29L97.036 0M22.075 72.333l18.13-17.725-10.912-11.71M54.152 0l-9.69 8.738 16.298.608M16.482 0l3.48 7.133 19.18 1.195M26.75 36.986l14.17-26.434L-.23 8.328M28.4 38.662L41.785 53.04 56.55 38.567l4.582-26.957-17.993-.918" fill="#29b2fe"/></svg>),
  Glassdoor: () => <GlassDoorIcon className="w-full h-full" />,
  Hired: () => <HiredIcon className="w-full h-full" />,
  WellFound: () => <WellFoundIcon className="w-full h-full" />,
};

export const ICON_LIST = [
  { name: 'LinkedIn', Icon: IntegrationIcons.LinkedIn },
  { name: 'Indeed', Icon: IntegrationIcons.Indeed },
  { name: 'Glints', Icon: IntegrationIcons.Glints },
  { name: 'JobStreet', Icon: IntegrationIcons.JobStreet },
  { name: 'Kalibrr', Icon: IntegrationIcons.Kalibrr },
  { name: 'LokerID', Icon: IntegrationIcons.LokerID },
  { name: 'Toptal', Icon: IntegrationIcons.Toptal },
  { name: 'Upwork', Icon: IntegrationIcons.Upwork },
  { name: 'Freelancer', Icon: IntegrationIcons.Freelancer },
  { name: 'Glassdoor', Icon: IntegrationIcons.Glassdoor },
  { name: 'Hired', Icon: IntegrationIcons.Hired },
  { name: 'WellFound', Icon: IntegrationIcons.WellFound },
];
