export const ProductSideNavExample = ({}) => (          {/* SideNav double wide product SideNav  */}
          <SideNav
            aria-label='Side navigation1'
            expanded={isSideNavExpanded}
            onSideNavBlur={onClickSideNavExpand}
            isCollapsible
            isTreeview
            onOverlayClick={onClickSideNavExpand}
            className='nav--global'
          >
            <SideNavItems>
              <SideNavMenu
                renderIcon={SquareOutline}
                title='Sub-menu level 1x'
                // primary
                // defaultExpanded
              ></SideNavMenu>
              {routesInSideNav.map(({ path, carbon }) =>
                !carbon?.inSubMenu && carbon?.label ? (
                  carbon?.subMenu ? (
                    <SideNavMenu
                      // primary
                      renderIcon={carbon?.icon}
                      title={carbon?.label}
                      key={path}
                    >
                      {/* <SideNavSlot renderIcon={SquareOutline}>
                        <Dropdown
                          id="default"
                          size="sm"
                          itemToString={(item) => (item ? item.text : "")}
                          items={[
                            { text: "Option 1" },
                            { text: "Option 2" },
                            { text: "Option 3" },
                          ]}
                          label="Choose an option"
                        />
                      </SideNavSlot> */}

                      {carbon?.subMenu.map((subRoute) => (
                        <SideNavMenuItem
                          as={RouterLink}
                          to={subRoute.path}
                          isActive={subRoute.path === location.pathname}
                          key={subRoute.path}
                        >
                          {subRoute.carbon?.label}
                        </SideNavMenuItem>
                      ))}
                    </SideNavMenu>
                  ) : (
                    <div key={path}>
                      <SideNavLink
                        as={RouterLink}
                        to={path}
                        isActive={path === location.pathname}
                        renderIcon={carbon?.icon}
                      >
                        {carbon?.label}
                      </SideNavLink>
                      {carbon?.separator && <SideNavDivider />}
                    </div>
                  )
                ) : null,
              )}
            </SideNavItems>
          </SideNav>)