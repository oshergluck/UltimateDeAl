import { createCampaign, dashboard, logout, money, payment, profile, withdraw,email ,atom2,loader} from '../assets';

export const navlinks = [
  {
    name: 'Home',
    imgUrl: email,
    link: '/',
  },
  {
    name: 'All Campaigns',
    imgUrl: dashboard,
    link: '/campaigns',
  },
  {
    name: 'New Campaign',
    imgUrl: money,
    link: '/create-campaign',
  },
  {
    name: 'Your Campaigns',
    imgUrl: profile,
    link: '/profile',
  },
  {
  name: 'VIP',
  imgUrl: withdraw,
  link: '/become-vip',
},
{
  name: 'Admin',
  imgUrl: atom2,
  link: '/user-admin-page',
},
{
  name: 'StoreVIP',
  imgUrl: payment,
  link: '/store-vip',
},
];
