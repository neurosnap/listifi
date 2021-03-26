import { HamburgerIcon } from '@chakra-ui/icons';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Heading,
  IconButton,
  useDisclosure,
  Link,
} from '@chakra-ui/react';
import React from 'react';
import { Link as RLink } from 'react-router-dom';

import { homeUrl } from '@app/routes';
import { FooterAppLinks } from './footer';

export function Menu() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <IconButton
        aria-label="open menu"
        variant="rainbow"
        icon={<HamburgerIcon />}
        onClick={onOpen}
      />
      <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay>
          <DrawerContent>
            <DrawerHeader
              borderBottomWidth="1px"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              pt={4}
            >
              <Heading mr={4}>
                <Link variant="basic" as={RLink} to={homeUrl()}>
                  listifi
                </Link>
              </Heading>
              <IconButton
                aria-label="open menu"
                variant="rainbow"
                icon={<HamburgerIcon />}
                onClick={onClose}
              />
            </DrawerHeader>
            <DrawerBody>
              <FooterAppLinks />
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </>
  );
}
