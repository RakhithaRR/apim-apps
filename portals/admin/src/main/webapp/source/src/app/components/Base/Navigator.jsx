import React from 'react';
import { useAppContext } from 'AppComponents/Shared/AppContext';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withStyles, useTheme } from '@material-ui/core/styles';
import { useIntl } from 'react-intl';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import RouteMenuMapping from 'AppComponents/Base/RouteMenuMapping';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import Configurations from 'Config';
import CONSTS from 'AppData/Constants';
import NavigatorChildren from './NavigatorChildren';

const styles = (theme) => ({
    categoryHeader: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        '& svg': {
            color: theme.palette.common.white,
        },
    },
    categoryHeaderPrimary: {
        color: theme.palette.common.white,
    },
    item: {
        paddingTop: 1,
        paddingBottom: 1,
        color: 'rgba(255, 255, 255, 0.7)',
        '&:hover,&:focus': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
    },
    firebase: {
        fontSize: 24,
        color: theme.palette.common.white,
    },
    itemActiveItem: {
        color: '#4fc3f7',
    },
    itemPrimary: {
        fontSize: 'inherit',
    },
    itemIcon: {
        minWidth: 'auto',
        marginRight: theme.spacing(2),
    },
    divider: {
        marginTop: theme.spacing(2),
    },
    logoWrapper: {
        padding: 0,
        paddingLeft: theme.spacing(1),
        height: 50,
    },
});

/**
 * Render a list
 * @param {JSON} props .
 * @returns {JSX} Header AppBar components.
 */
function Navigator(props) {
    const {
        classes, history, ...other
    } = props;
    const theme = useTheme();
    const intl = useIntl();
    const { settings, user: { _scopes } } = useAppContext();
    const isAnalyticsEnabled = settings.analyticsEnabled;
    const matchMenuPath = (currentRoute, pathToMatch) => {
        return (currentRoute.indexOf(pathToMatch) !== -1);
    };
    let routeMenuMapping = RouteMenuMapping(intl);
    if (!isAnalyticsEnabled) {
        routeMenuMapping = RouteMenuMapping(intl).filter((menu) => menu.id !== 'Manage Alerts');
    }

    const hasPermission = (scopes) => {
        for (let i = 0; i < scopes.length; i++) {
            if (!_scopes.includes(scopes[i])) {
                return false;
            }
        }
        return true;
    };

    const isWorkflowManager = hasPermission(CONSTS.Roles.WORKFLOW_MANAGER);
    const isSettingsManager = hasPermission(CONSTS.Roles.SETTINGS_MANAGER);
    const isPolicyManager = hasPermission(CONSTS.Roles.POLICY_MANAGER);
    const iskeyManagers = hasPermission(CONSTS.Roles.KEY_MANAGER);
    const isAPICategory = hasPermission(CONSTS.Roles.CATEGORY_MANAGER);
    const isGatewayManager = hasPermission(CONSTS.Roles.GATEWAY_MANAGER);

    const entireArray = [];
    const checkRouteMenuMapping = routeMenuMapping;
    for (let i = 0; i < checkRouteMenuMapping.length; i++) {
        const adminRoute = routeMenuMapping;
        if (checkRouteMenuMapping[i].id === 'Dashboard') {
            const dashboardObj = checkRouteMenuMapping[i];
            entireArray.push(dashboardObj);
        }
        if (checkRouteMenuMapping[i].id === 'Rate Limiting Policies') {
            const policyObj = checkRouteMenuMapping[i];
            if (isPolicyManager) {
                entireArray.push(policyObj);
            }
        }
        if (checkRouteMenuMapping[i].id === 'Tasks') {
            const taskObj = checkRouteMenuMapping[i];
            if (isWorkflowManager) {
                entireArray.push(taskObj);
            }
        }
        if (checkRouteMenuMapping[i].id === 'Key Managers') {
            const keyManagerObj = checkRouteMenuMapping[i];
            if (iskeyManagers) {
                entireArray.push(keyManagerObj);
            }
        }
        if (checkRouteMenuMapping[i].id === 'API Categories') {
            const apiCatObj = checkRouteMenuMapping[i];
            if (isAPICategory) {
                entireArray.push(apiCatObj);
            }
        }
        if (checkRouteMenuMapping[i].id === 'Gateways') {
            const gatewayObj = checkRouteMenuMapping[i];
            if (isGatewayManager) {
                entireArray.push(gatewayObj);
            }
        }
        if (checkRouteMenuMapping[i].id === 'Settings') {
            const settingObj = checkRouteMenuMapping[i];
            const val = settingObj;
            const childRoutes = val.children;
            if (!_scopes.includes('apim:admin')) {
                for (let k = 0; k < childRoutes.length; k++) {
                    if (childRoutes[k].id === 'Advanced') {
                        childRoutes.splice(k, 1);
                    }
                }
            }
            if (isSettingsManager) {
                entireArray.push(val);
            }
        }
        routeMenuMapping = entireArray;
        if (_scopes.includes('apim:admin')) {
            routeMenuMapping = adminRoute;
        }
    }

    const updateAllRoutePaths = (path) => {
        for (let i = 0; i < routeMenuMapping.length; i++) {
            const childRoutes = routeMenuMapping[i].children;
            if (childRoutes) {
                for (let j = 0; j < childRoutes.length; j++) {
                    if (matchMenuPath(path, childRoutes[j].path)) {
                        childRoutes[j].active = true;
                    } else {
                        childRoutes[j].active = false;
                    }
                }
            } else if (matchMenuPath(path, routeMenuMapping[i].path)) {
                routeMenuMapping[i].active = true;
            } else {
                routeMenuMapping[i].active = false;
            }
        }
    };
    history.listen((location) => {
        const { pathname } = location;
        updateAllRoutePaths(pathname);
    });
    const { location: { pathname: currentPath } } = history;
    updateAllRoutePaths(currentPath);

    let logoUrl = '/site/public/images/logo.svg';
    let logoWidth = 180;
    let logoHeight = '';
    if (theme.custom && theme.custom.logo) {
        logoUrl = theme.custom.logo;
    }
    if (theme.custom && theme.custom.logoWidth) {
        logoWidth = theme.custom.logoWidth;
    }
    if (theme.custom && theme.custom.logoHeight) {
        logoHeight = theme.custom.logoHeight;
    }

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Drawer variant='permanent' {...other}>
            <List disablePadding role='list'>
                <ListItem className={clsx(classes.firebase, classes.item, 'itemCategory', classes.logoWrapper)}>
                    <Link component={RouterLink} to='/'>
                        <img
                            alt='logo APIM admin portal'
                            src={Configurations.app.context
                                + logoUrl}
                            width={logoWidth}
                            height={logoHeight}
                        />
                    </Link>
                </ListItem>

                {routeMenuMapping.map(({
                    id, children, icon: parentIcon, path: parentPath, active: parentActive,
                }) => (
                    <>
                        {!children && (
                            <Link
                                component={RouterLink}
                                to={parentPath}
                                style={{ textDecoration: 'none' }}
                                data-testid={id}
                            >
                                <List disablePadding role='list'>
                                    <ListItem
                                        className={clsx(
                                            classes.item,
                                            'itemCategory',
                                            parentActive && classes.itemActiveItem,
                                        )}
                                    >
                                        <ListItemIcon className={classes.itemIcon}>
                                            {parentIcon}
                                        </ListItemIcon>
                                        <ListItemText
                                            classes={{
                                                primary: classes.itemPrimary,
                                            }}
                                        >
                                            {id}
                                        </ListItemText>
                                    </ListItem>
                                </List>
                            </Link>
                        )}
                        {children && (
                            <React.Fragment key={id} role='listitem'>
                                <NavigatorChildren
                                    navChildren={children}
                                    navId={id}
                                    classes={classes}
                                    role='listitem'
                                />
                            </React.Fragment>
                        )}

                    </>
                ))}
            </List>
        </Drawer>
    );
}

Navigator.propTypes = {
    classes: PropTypes.shape({}).isRequired,
};

export default withRouter(withStyles(styles)(Navigator));
