/*
* Copyright (c) 2024, WSO2 LLC. (http://www.wso2.org) All Rights Reserved.
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
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { FormattedMessage } from 'react-intl';

/**
 * @inheritdoc
 * @class apiTableHead
 * @extends {Component}
 */
const apisTableHead = (props) => {
    const createSortHandler = (property) => (event) => {
        props.onRequestSort(event, property);
    };
    const columnData = [
        {
            id: 'name',
            numeric: false,
            disablePadding: true,
            label: (<FormattedMessage
                id='Apis.Listing.apiTableHead.name'
                defaultMessage='Name'
            />),
            sorting: true,
            width: 200,
        },
        {
            id: 'version',
            numeric: false,
            disablePadding: true,
            label: (<FormattedMessage
                id='Apis.Listing.apiTableHead.version'
                defaultMessage='Version'
            />),
            sorting: true,
            width: 100,
        },
        {
            id: 'provider',
            numeric: false,
            disablePadding: false,
            label: (<FormattedMessage
                id='Apis.Listing.apiTableHead.provider'
                defaultMessage='Provider'
            />),
            sorting: true,
            width: 130,
        },
    ];
    const { order, orderBy } = props;
    return (
        <TableHead>
            <TableRow>
                {columnData.map((column) => {
                    return (
                        <TableCell
                            key={column.id}
                            align='left'
                            sortDirection={orderBy === column.id ? order : false}
                            width={column.width}
                            style={{ marginLeft: 50 }}
                        >
                            {column.sorting ? (
                                <TableSortLabel
                                    active={orderBy === column.id}
                                    direction={order}
                                    onClick={createSortHandler(column.id)}
                                >
                                    {column.label}
                                </TableSortLabel>
                            ) : (
                                column.label
                            )}
                        </TableCell>
                    );
                })}
            </TableRow>
        </TableHead>
    );
};
apisTableHead.propTypes = {
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
};
export default apisTableHead;
