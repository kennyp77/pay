import ClusterIconHref from '../../components/icons/assets-non-inline/cluster-circle.svg';

import { cnMap } from './map';

export function createCluster(): YMaps.Clusterer {
    return new window.ymaps.Clusterer({
        // @ts-ignore
        clusterIcons: [
            {
                href: ClusterIconHref,
                size: [60, 60],
                offset: [-30, -30],
            },
            {
                href: ClusterIconHref,
                size: [80, 80],
                offset: [-38, -38],
            },
        ],
        clusterNumbers: [10],
        hasBalloon: false,
        hasHint: false,
        useMapMargin: true,
        // На момент исполнения конфиг файла window.ymaps === undefined (Карта еще не загружается)
        //@ts-ignore
        clusterIconContentLayout: window.ymaps.templateLayoutFactory.createClass(
            `<span class="${cnMap('ClusterIcon')}">{{properties.iconContent}}</span>`,
        ),
    });
}
