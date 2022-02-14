import {
  ModalBody,
  Flex,
  Image,
  Text,
  Button,
  Box,
  IconButton,
  Divider,
  Heading,
  Link,
} from '@chakra-ui/react';
import React from 'react';
import Dropdown from '../../ui/forms/dropdown';
import SingleLineInput from '../../ui/forms/singleLineInput';
import Modal from '../../ui/modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function AddFunds({ isOpen, onClose }: Props) {
  const [type, setType] = React.useState(-1);
  const [funding, setFunding] = React.useState('');
  const [error, setError] = React.useState(false);

  const nextScreenTexts = ['Deposit funds from another wallet', 'Deposit funds from connected wallet'];
  const stepsWhenAddingFromAnotherWallet = ['Open your wallet which has funds.', 'Send the funds to the address below.'];
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose()}
      title="Add Funds"
      leftIcon={type !== -1 && (
        <IconButton
          aria-label="Back"
          variant="ghost"
          _hover={{}}
          _active={{}}
          icon={<Image mr={8} src="/ui_icons/black/chevron_left.svg" />}
          onClick={() => setType(-1)}
        />
      )}
      rightIcon={(
        <Flex direction="row" justify="start" align="center">
          <Button
            _focus={{}}
            variant="link"
            color="#AA82F0"
            leftIcon={<Image src="/sidebar/discord_icon.svg" />}
          >
            Support 24*7
          </Button>
          {type === -1 && <Box mr={4} />}
          {type === -1 && (
          <IconButton
            aria-label="close-button"
            size="14px"
            icon={<Image boxSize="14px" src="/ui_icons/close.svg" />}
            _hover={{}}
            _active={{}}
            variant="ghost"
            onClick={() => onClose()}
          />
          )}
        </Flex>
      )}
      width={527}
      // closeOnOverlayClick
    >
      <ModalBody>
        {type === -1 && (
        <Flex px={7} mb={7} direction="column" justify="start" align="center">
          <Image src="/illustrations/add_funds_body.svg" />
          <Text
            mt={10}
            textAlign="center"
            fontSize="28px"
            lineHeight="40px"
            fontWeight="700"
          >
            Verified grants = 10x applicants
          </Text>
          <Text variant="applicationText" textAlign="center" mt="3px">
            Add funds to get a verified badge.
          </Text>
          <Text variant="applicationText" textAlign="center" mt={0}>
            Deposit and withdraw funds anytime.
          </Text>
          <Flex direction="column" mt={8} w="100%">
            <Divider />
            {nextScreenTexts.map((text, index) => (
              <>
                <Flex direction="row" justify="space-between" align="center" mx={4}>
                  <Flex direction="row">
                    <Text variant="tableBody" color="#8850EA" my={4}>
                      {text}
                      {' '}
                    </Text>
                    <Image
                      ml={2}
                      display="inline-block"
                      alt="another_wallet"
                      src="/ui_icons/info_brand_light.svg"
                    />
                  </Flex>
                  <IconButton
                    aria-label="right_chevron"
                    variant="ghost"
                    _hover={{}}
                    _active={{}}
                    w="13px"
                    h="6px"
                    icon={<Image src="/ui_icons/brand/chevron_right.svg" />}
                    onClick={() => setType(index)}
                  />
                </Flex>
                <Divider />
              </>
            ))}
          </Flex>
        </Flex>
        )}
        {type === 0 && (
        <Flex direction="column">
          <Heading variant="page">Deposit funds from another wallet</Heading>
          <Flex direction="column" align="start">
            {stepsWhenAddingFromAnotherWallet.map((text, index) => (
              <Flex direction="row" justify="start" mt={8} align="center">
                <Flex
                  bg="brand.500"
                  w={10}
                  h={10}
                  borderRadius="50%"
                  justify="center"
                  align="center"
                  mr={4}
                >
                  <Text
                    variant="tableBody"
                    color="white"
                    textAlign="center"
                  >
                    {index + 1}
                  </Text>
                </Flex>
                <Text>{text}</Text>
              </Flex>
            ))}
          </Flex>
          <Flex w="100%" mt={7}>
            <SingleLineInput
              label="Smart Contract Address"
              height="80px"
              inputRightElement={(
                <Button variant="primary" w="89px" h="48px" mr={20}>
                  Copy
                </Button>
              )}
              placeholder="0xb794f5fss35x9268"
              // subtext="Send only ETH token to this address."
              value={undefined}
              onChange={() => {}}
              isError={false}
              subtextAlign="center"
              tooltip="Smart Contract Address is the address of the smart contract that will receive the funds."
            />
          </Flex>
          <Heading variant="applicationHeading" textAlign="center" color="#717A7C" mt={4}>
            Send only ETH token to this address.
          </Heading>
          <Button variant="primary" my={8} onClick={() => onClose()}>
            OK
          </Button>
        </Flex>
        )}
        {type === 1 && (
        <Flex direction="column">
          <Heading variant="page">Deposit funds from your wallet</Heading>
          <Flex direction="row" mt={5}>
            <Image src="/ui_icons/grant_reward.svg" />
            <Flex flex={1} direction="column" ml={3}>
              <Text fontWeight="500">Grant Reward</Text>
              <Text variant="footer" color="brand.500" fontWeight="700">
                60 ETH
              </Text>
            </Flex>
          </Flex>
          <Flex direction="row" w="100%" alignItems="flex-end" justify="space-between" mt={5}>
            <Flex w="70%" direction="column">
              <SingleLineInput
                label="Deposit Amount"
                placeholder="100"
                value={funding}
                onChange={(e) => {
                  if (error) {
                    setError(false);
                  }
                  setFunding(e.target.value);
                }}
                isError={error}
                errorText="Required"
              />
            </Flex>
            <Flex direction="column" w="25%">
              <Dropdown
                listItemsMinWidth="132px"
                listItems={[
                  {
                    icon: '/images/dummy/Ethereum Icon.svg',
                    label: 'ETH',
                  },
                ]}
              />
            </Flex>
          </Flex>
          <Text mt={1} variant="tableHeader" color="#122224">
            Wallet Balance
            {' '}
            <Text variant="tableHeader" display="inline-block">2 ETH</Text>
          </Text>
          <Button variant="primary" my={8} onClick={() => onClose()}>
            Deposit
          </Button>
        </Flex>
        )}
      </ModalBody>
    </Modal>
  );
}

export default AddFunds;
