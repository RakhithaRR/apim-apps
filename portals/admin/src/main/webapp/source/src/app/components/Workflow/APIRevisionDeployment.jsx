/* eslint-disable react/jsx-props-no-spreading */
/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import MUIDataTable from 'mui-datatables';
import ContentBase from 'AppComponents/AdminPages/Addons/ContentBase';
import InlineProgress from 'AppComponents/AdminPages/Addons/InlineProgress';
import Alert from 'AppComponents/Shared/Alert';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import HelpBase from 'AppComponents/AdminPages/Addons/HelpBase';
import DescriptionIcon from '@material-ui/icons/Description';
import Link from '@material-ui/core/Link';
import Configurations from 'Config';
import API from 'AppData/api';
import Button from '@material-ui/core/Button';
import * as dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import WarningBase from 'AppComponents/AdminPages/Addons/WarningBase';
import { Alert as MUIAlert } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
    searchInput: {
        fontSize: theme.typography.fontSize,
    },
    block: {
        display: 'block',
    },
    contentWrapper: {
        margin: theme.spacing(2),
    },
    approveButton: {
        textDecoration: 'none',
        backgroundColor: theme.palette.success.light,
    },
    rejectButton: {
        textDecoration: 'none',
        backgroundColor: theme.palette.error.light,
    },
}));

/**
 * Render a list
 * @param {JSON} props props passed from parent
 * @returns {JSX} Header AppBar components.
 */
function ListLabels() {
    const intl = useIntl();
    const [data, setData] = useState(null);
    const restApi = new API();
    const classes = useStyles();
    const [searchText, setSearchText] = useState('');
    const [isUpdating, setIsUpdating] = useState(null);
    const [buttonValue, setButtonValue] = useState();
    const [hasListPermission, setHasListPermission] = useState(true);
    const [errorMessage, setError] = useState(null);

    /**
     * API call to get Detected Data
     * @returns {Promise}.
     */
    function apiCall() {
        return restApi
            .workflowsGet('AM_REVISION_DEPLOYMENT')
            .then((result) => {
                const workflowlist = result.body.list.map((obj) => {
                    return {
                        description: obj.description,
                        apiName: obj.properties.apiName,
                        apiVersion: obj.properties.apiVersion,
                        environment: obj.properties.environment,
                        revisionId: obj.properties.revisionId,
                        userName: obj.properties.userName,
                        referenceId: obj.referenceId,
                        createdTime: obj.createdTime,
                        properties: obj.properties,
                    };
                });
                return workflowlist;
            })
            .catch((error) => {
                const { status } = error;
                if (status === 401) {
                    setHasListPermission(false);
                } else {
                    Alert.error(intl.formatMessage({
                        id: 'Workflow.APIRevisionDeployment.apiCall.has.errors',
                        defaultMessage: 'Unable to get workflow pending requests for Revision Deployment',
                    }));
                    throw (error);
                }
            });
    }

    const fetchData = () => {
    // Fetch data from backend
        setData(null);
        const promiseAPICall = apiCall();
        promiseAPICall.then((LocalData) => {
            setData(LocalData);
        })
            .catch((e) => {
                console.error('Unable to fetch data. ', e.message);
                setError(e.message);
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateStatus = (referenceId, value) => {
        setButtonValue(value);
        const body = { status: value, attributes: {}, description: '' };
        setIsUpdating(true);
        if (value === 'APPROVED') {
            body.description = 'Approve workflow request.';
        }
        if (value === 'REJECTED') {
            body.description = 'Reject workflow request.';
        }

        const promisedupdateWorkflow = restApi.updateWorkflow(referenceId, body);
        return promisedupdateWorkflow
            .then(() => {
                setIsUpdating(false);
                Alert.success(intl.formatMessage({
                    id: 'Workflow.APIRevisionDeployment.update.success',
                    defaultMessage: 'Workflow status is updated successfully',
                }));
            })
            .catch((error) => {
                const { response, status } = error;
                const { body: { description } } = response;
                if (status === 401) {
                    Alert.error(description);
                } else if (response.body) {
                    Alert.error(intl.formatMessage({
                        id: 'Workflow.APIRevisionDeployment.updateStatus.has.errors',
                        defaultMessage: 'Unable to complete revision deployment approve/reject process. ',
                    }));
                    throw (response.body.description);
                }
                setIsUpdating(false);
                return null;
            })
            .then(() => {
                fetchData();
            });
    };

    const pageProps = {
        help: (
            <HelpBase>
                <List component='nav' aria-label='main mailbox folders'>
                    <ListItem button>
                        <ListItemIcon>
                            <DescriptionIcon />
                        </ListItemIcon>
                        <Link
                            target='_blank'
                            href={Configurations.app.docUrl
                        + 'deploy-and-publish/deploy-on-gateway/deploy-api/revision-deployment-workflow'}
                        >
                            <ListItemText primary={(
                                <FormattedMessage
                                    id='Workflow.APIRevisionDeployment.help.link.one'
                                    defaultMessage='Create a Revision Deployment approval workflow Request'
                                />
                            )}
                            />
                        </Link>
                    </ListItem>
                </List>
            </HelpBase>),

        pageStyle: 'half',
        title: intl.formatMessage({
            id: 'Workflow.APIRevisionDeployment.title.revisiondeployment',
            defaultMessage: 'Revision Deployment - Approval Tasks',
        }),
    };

    const columProps = [
        {
            name: 'description',
            label: intl.formatMessage({
                id: 'Workflow.APIRevisionDeployment.table.header.description',
                defaultMessage: 'Description',
            }),
            options: {
                sort: false,
                display: false,
            },
        },
        {
            name: 'apiName',
            label: intl.formatMessage({
                id: 'Workflow.APIRevisionDeployment.table.header.apiName',
                defaultMessage: 'API',
            }),
            options: {
                sort: false,
                filter: true,
            },
        },
        {
            name: 'apiVersion',
            label: intl.formatMessage({
                id: 'Workflow.APIRevisionDeployment.table.header.apiVersion',
                defaultMessage: 'API',
            }),
            options: {
                sort: false,
                filter: true,
            },
        },
        {
            name: 'revisionId',
            label: intl.formatMessage({
                id: 'Workflow.APIRevisionDeployment.table.header.revisionId',
                defaultMessage: 'Revision Id',
            }),
            options: {
                sort: false,
                filter: true,
            },
        },
        {
            name: 'environment',
            label: intl.formatMessage({
                id: 'Workflow.APIRevisionDeployment.table.header.environment',
                defaultMessage: 'Environment',
            }),
            options: {
                sort: false,
                filter: true,
            },
        },
        {
            name: 'userName',
            label: intl.formatMessage({
                id: 'Workflow.APIRevisionDeployment.table.header.userName',
                defaultMessage: 'Created by',
            }),
            options: {
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    const dataRow = data[tableMeta.rowIndex];
                    const { properties } = dataRow;
                    const { createdTime } = dataRow;
                    dayjs.extend(relativeTime);
                    const time = dayjs(createdTime).fromNow();
                    dayjs.extend(localizedFormat);
                    const format = dayjs(createdTime).format('LLL');
                    return (
                        <div>
                            {properties.userName}
                            <br />
                            <Tooltip title={format}>
                                <Typography color='textSecondary' variant='caption'>
                                    {time}
                                </Typography>
                            </Tooltip>
                        </div>
                    );
                },
            },
        },
        {
            name: 'action',
            label: intl.formatMessage({
                id: 'Workflow.APIRevisionDeployment.table.header.Action',
                defaultMessage: 'Action',
            }),
            options: {
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    const dataRow = data[tableMeta.rowIndex];
                    const { referenceId } = dataRow;
                    return (
                        <div>
                            <Box component='span' m={1}>
                                <Button
                                    className={classes.approveButton}
                                    variant='contained'
                                    size='small'
                                    onClick={() => updateStatus(referenceId, 'APPROVED')}
                                    disabled={isUpdating}
                                >
                                    <CheckIcon />
                                    <FormattedMessage
                                        id='Workflow.APIRevisionDeployment.table.button.approve'
                                        defaultMessage='Approve'
                                    />
                                    {(isUpdating && buttonValue === 'APPROVED') && <CircularProgress size={15} /> }
                                </Button>
                                &nbsp;&nbsp;
                                <Button
                                    className={classes.rejectButton}
                                    variant='contained'
                                    size='small'
                                    onClick={() => updateStatus(referenceId, 'REJECTED')}
                                    disabled={isUpdating}
                                >
                                    <ClearIcon />
                                    <FormattedMessage
                                        id='Workflow.APIRevisionDeployment.table.button.reject'
                                        defaultMessage='Reject'
                                    />
                                    {(isUpdating && buttonValue === 'REJECTED') && <CircularProgress size={15} />}
                                </Button>
                            </Box>
                        </div>
                    );
                },
            },
        },
    ];

    const addButtonProps = {};
    const addButtonOverride = null;
    const noDataMessage = (
        <FormattedMessage
            id='AdminPages.Addons.ListBase.nodata.message'
            defaultMessage='No items yet'
        />
    );

    const searchActive = true;
    const searchPlaceholder = intl.formatMessage({
        id: 'Workflow.APIRevisionDeployment.search.default',
        defaultMessage: 'Search by Revision Id, API name, Environment or Created by',
    });

    const filterData = (event) => {
        setSearchText(event.target.value);
    };

    const columns = [
        ...columProps,
    ];

    const options = {
        filterType: 'checkbox',
        selectableRows: 'none',
        filter: false,
        search: false,
        print: false,
        download: false,
        viewColumns: false,
        customToolbar: null,
        responsive: 'stacked',
        searchText,
    };
    if (data && data.length === 0) {
        return (
            <ContentBase
                {...pageProps}
                pageStyle='small'
            >
                <Card className={classes.root}>
                    <CardContent>
                        <Typography gutterBottom variant='h5' component='h2'>
                            <FormattedMessage
                                id='Workflow.APIRevisionDeployment.List.empty.title.revisiondeployments'
                                defaultMessage='Revision Deployment'
                            />
                        </Typography>
                        <Typography variant='body2' color='textSecondary' component='p'>
                            <FormattedMessage
                                id='Workflow.APIRevisionDeployment.List.empty.content.revisiondeployments'
                                defaultMessage='There are no pending workflow requests for revision deployment.'
                            />
                        </Typography>
                    </CardContent>
                    <CardActions>
                        {addButtonOverride || (
                            // eslint-disable-next-line react/no-unknown-property
                            <span updateList={fetchData} {...addButtonProps} />
                        )}
                    </CardActions>
                </Card>
            </ContentBase>
        );
    }
    if (!hasListPermission) {
        return (
            <WarningBase
                pageProps={pageProps}
                title={(
                    <FormattedMessage
                        id='Workflow.APIRevisionDeployment.permission.denied.title'
                        defaultMessage='Permission Denied'
                    />
                )}
                content={(
                    <FormattedMessage
                        id='Workflow.APIRevisionDeployment.permission.denied.content'
                        defaultMessage={'You do not have enough permission to view Revision Deployment - '
                        + 'Approval Tasks. Please contact the site administrator.'}
                    />
                )}
            />
        );
    }
    if (!errorMessage && !data) {
        return (
            <ContentBase pageStyle='paperLess'>
                <InlineProgress />
            </ContentBase>

        );
    }
    if (errorMessage) {
        return (
            <ContentBase {...pageProps}>
                <MUIAlert severity='error'>{errorMessage}</MUIAlert>
            </ContentBase>

        );
    }
    return (
        <>
            <ContentBase {...pageProps}>
                {(searchActive || addButtonProps) && (
                    <AppBar className={classes.searchBar} position='static' color='default' elevation={0}>
                        <Toolbar>
                            <Grid container spacing={2} alignItems='center'>
                                <Grid item>
                                    {searchActive && (<SearchIcon className={classes.block} color='inherit' />)}
                                </Grid>
                                <Grid item xs>
                                    {searchActive && (
                                        <TextField
                                            fullWidth
                                            placeholder={searchPlaceholder}
                                            InputProps={{
                                                disableUnderline: true,
                                                className: classes.searchInput,
                                            }}
                                            onChange={filterData}
                                        />
                                    )}
                                </Grid>
                                <Grid item>
                                    {addButtonOverride || (
                                        <span
                                            // eslint-disable-next-line react/no-unknown-property
                                            updateList={fetchData}
                                            {...addButtonProps}
                                        />
                                    )}
                                    <Tooltip title={(
                                        <FormattedMessage
                                            id='AdminPages.Addons.ListBase.reload'
                                            defaultMessage='Reload'
                                        />
                                    )}
                                    >
                                        <IconButton onClick={fetchData}>
                                            <RefreshIcon className={classes.block} color='inherit' />
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                            </Grid>
                        </Toolbar>
                    </AppBar>
                )}
                {data && data.length > 0 && (
                    <MUIDataTable
                        title={null}
                        data={data}
                        columns={columns}
                        options={options}
                    />
                )}
                {data && data.length === 0 && (
                    <div className={classes.contentWrapper}>
                        <Typography color='textSecondary' align='center'>
                            {noDataMessage}
                        </Typography>
                    </div>
                )}
            </ContentBase>
        </>
    );
}

export default ListLabels;
