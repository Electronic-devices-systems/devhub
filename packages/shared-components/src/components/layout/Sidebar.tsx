import React, { PureComponent } from 'react'
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { connect } from 'react-redux'

import { ExtractPropsFromConnector } from 'shared-core/dist/types'
import { getColumnHeaderDetails } from 'shared-core/dist/utils/helpers/github/events'
import * as actions from '../../redux/actions'
import * as selectors from '../../redux/selectors'
import { ColumnRP } from '../../render-props/ColumnRP'
import { emitter } from '../../setup'
import { sidebarSize } from '../../styles/variables'
import { ColumnHeaderItem } from '../columns/ColumnHeaderItem'
import { Avatar } from '../common/Avatar'
import { Link } from '../common/Link'
import { Separator } from '../common/Separator'
import { ThemeConsumer } from '../context/ThemeContext'

const logo = require('shared-components/assets/logo.png') // tslint:disable-line

const styles = StyleSheet.create({
  centerContainer: {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export interface SidebarProps {
  horizontal?: boolean
  small?: boolean
}

const connectToStore = connect(
  (state: any) => ({
    columnIds: selectors.columnIdsSelector(state),
    currentOpenedModal: selectors.currentOpenedModal(state),
    username: selectors.currentUsernameSelector(state),
  }),
  {
    replaceModal: actions.replaceModal,
  },
)

class SidebarComponent extends PureComponent<
  SidebarProps & ExtractPropsFromConnector<typeof connectToStore>
> {
  render() {
    const {
      columnIds,
      currentOpenedModal,
      horizontal,
      replaceModal,
      small,
      username,
    } = this.props

    const squareStyle = {
      width: sidebarSize,
      height: sidebarSize,
    }

    return (
      <ThemeConsumer>
        {({ theme }) => (
          <SafeAreaView
            style={{
              width: horizontal ? undefined : sidebarSize,
              backgroundColor: theme.backgroundColor,
            }}
          >
            <View
              style={{
                flexGrow: 1,
                flexDirection: horizontal ? 'row' : 'column',
                width: horizontal ? '100%' : sidebarSize,
                height: horizontal ? sidebarSize : '100%',
              }}
            >
              {!horizontal && (
                <>
                  <View
                    style={[
                      styles.centerContainer,
                      squareStyle,
                      {
                        backgroundColor: theme.backgroundColorLess08,
                      },
                    ]}
                  >
                    <Avatar
                      shape="circle"
                      size={sidebarSize / 2}
                      username={username}
                    />
                  </View>

                  <Separator horizontal={!horizontal} />
                </>
              )}

              {!small && (
                <>
                  <TouchableOpacity
                    onPress={() => replaceModal({ name: 'ADD_COLUMN' })}
                    style={[styles.centerContainer, squareStyle]}
                  >
                    <ColumnHeaderItem iconName="plus" />
                  </TouchableOpacity>

                  <Separator horizontal={!horizontal} />
                </>
              )}

              <ScrollView
                alwaysBounceHorizontal={false}
                alwaysBounceVertical={false}
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent:
                    small && horizontal ? 'space-evenly' : undefined,
                }}
                horizontal={horizontal}
                style={{ flex: 1 }}
              >
                {!columnIds
                  ? null
                  : columnIds.map(columnId => {
                      return (
                        <ColumnRP
                          key={`sidebar-column-rp-${columnId}`}
                          columnId={columnId}
                        >
                          {({ column, columnIndex, subscriptions }) => {
                            if (!column) return null

                            const requestTypeIconAndData = getColumnHeaderDetails(
                              column,
                              subscriptions,
                            )

                            return (
                              <TouchableOpacity
                                key={`sidebar-column-${column.id}`}
                                style={[styles.centerContainer, squareStyle]}
                                onPress={() => {
                                  emitter.emit('FOCUS_ON_COLUMN', {
                                    animated: !small || !currentOpenedModal,
                                    columnId: column.id,
                                    columnIndex,
                                    highlight: !small,
                                  })
                                }}
                              >
                                <ColumnHeaderItem
                                  avatarProps={{
                                    ...requestTypeIconAndData.avatarProps,
                                    disableLink: true,
                                  }}
                                  iconName={requestTypeIconAndData.icon}
                                />
                              </TouchableOpacity>
                            )
                          }}
                        </ColumnRP>
                      )
                    })}

                {!!small && (
                  <TouchableOpacity
                    onPress={() =>
                      currentOpenedModal &&
                      currentOpenedModal.name === 'SETTINGS'
                        ? undefined
                        : replaceModal({ name: 'SETTINGS' })
                    }
                    style={[styles.centerContainer, squareStyle]}
                  >
                    <ColumnHeaderItem iconName="gear" />
                  </TouchableOpacity>
                )}
              </ScrollView>

              {!small && (
                <>
                  <Separator horizontal={!horizontal} />

                  <TouchableOpacity
                    onPress={() => replaceModal({ name: 'SETTINGS' })}
                    style={[styles.centerContainer, squareStyle]}
                  >
                    <ColumnHeaderItem iconName="gear" />
                  </TouchableOpacity>

                  <Link
                    href="https://twitter.com/brunolemos"
                    openOnNewTab
                    style={[styles.centerContainer, squareStyle]}
                  >
                    <Image
                      resizeMode="contain"
                      source={logo}
                      style={{
                        width: sidebarSize / 2,
                        height: sidebarSize / 2,
                        borderRadius: sidebarSize / (2 * 2),
                      }}
                    />
                  </Link>
                </>
              )}
            </View>
          </SafeAreaView>
        )}
      </ThemeConsumer>
    )
  }
}

export const Sidebar = connectToStore(SidebarComponent)