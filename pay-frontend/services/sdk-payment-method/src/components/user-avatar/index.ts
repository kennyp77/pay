import { block } from 'bem-cn';

import './styles.css';

interface UserAvatarProps {
    avatar: string;
    empty?: boolean;
    payButton?: boolean;
}

const b = block('user-avatar');

export default function UserAvatar({ avatar, empty, payButton }: UserAvatarProps): string {
    return `
    <img
      class="${b({ empty, 'pay-button': payButton })}"
      src="${avatar}"
      alt=""
    />
  `;
}
