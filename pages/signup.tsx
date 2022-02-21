import {
  Container, Text, ToastId, useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { ReactElement, useContext } from 'react';
import { useAccount, useContract, useSigner } from 'wagmi';
import { SupportedNetwork } from '@questbook/service-validator-client';
import InfoToast from '../src/components/ui/infoToast';
import Form from '../src/components/signup/create_dao/form';
import Loading from '../src/components/signup/create_dao/loading';
import CreateGrant from '../src/components/signup/create_grant';
import DaoCreated from '../src/components/signup/daoCreated';
import WorkspaceRegistryABI from '../src/contracts/abi/WorkspaceRegistryAbi.json';
import GrantFactoryABI from '../src/contracts/abi/GrantFactoryAbi.json';
import NavbarLayout from '../src/layout/navbarLayout';
import { ApiClientsContext } from './_app';
import config from '../src/constants/config';
import { uploadToIPFS } from '../src/utils/ipfsUtils';
import { parseAmount } from '../src/utils/formattingUtils';

function SignupDao() {
  const [{ data: accountData }] = useAccount();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [daoCreated, setDaoCreated] = React.useState(false);
  const [creatingGrant, setCreatingGrant] = React.useState(false);

  const [daoData, setDaoData] = React.useState<{
    name: string;
    description: string;
    image: string;
    network: string;
    id: string;
  } | null>(null);

  const apiClients = useContext(ApiClientsContext);
  const [signerStates] = useSigner();
  const workspaceFactoryContract = useContract({
    addressOrName: config.WorkspaceRegistryAddress,
    contractInterface: WorkspaceRegistryABI,
    signerOrProvider: signerStates.data,
  });

  const grantContract = useContract({
    addressOrName: config.GrantFactoryAddress,
    contractInterface: GrantFactoryABI,
    signerOrProvider: signerStates.data,
  });
  const handleFormSubmit = async (data: {
    name: string;
    description: string;
    image: File;
    network: string;
  }) => {
    try {
      if (!accountData || !accountData.address) {
        return;
      }
      if (!apiClients) return;

      setLoading(true);
      const { validatorApi } = apiClients;

      const imageHash = await uploadToIPFS(data.image);

      const {
        data: { ipfsHash },
      } = await validatorApi.validateWorkspaceCreate({
        title: data.name,
        about: data.description,
        logoIpfsHash: imageHash.hash,
        creatorId: accountData.address,
        socials: [],
        supportedNetworks: [data.network as SupportedNetwork],
      });

      const transaction = await workspaceFactoryContract.createWorkspace(
        ipfsHash,
      );
      // console.log(transaction);
      const transactionData = await transaction.wait();
      // console.log(transactionData);
      // console.log(transactionData.events[0].args.id);
      if (
        transactionData
        && transactionData.events.length > 0
        && transactionData.events[0].event === 'WorkspaceCreated'
      ) {
        const newId = transactionData.events[0].args.id;
        setDaoData({
          ...data,
          image: imageHash.hash,
          id: Number(newId).toString(),
        });
        setLoading(false);
        setDaoCreated(true);
      } else {
        throw new Error('Workspace not indexed');
      }
    } catch (error) {
      setLoading(false);
      // console.log(error);
    }
  };

  const [hasClicked, setHasClicked] = React.useState(false);
  const toastRef = React.useRef<ToastId>();
  const toast = useToast();

  const closeToast = () => {
    if (toastRef.current) {
      toast.close(toastRef.current);
    }
  };

  const showToast = ({ link }: { link: string }) => {
    toastRef.current = toast({
      position: 'top',
      render: () => <InfoToast link={link} close={closeToast} />,
    });
  };

  const handleGrantSubmit = async (data: any) => {
    if (!accountData || !accountData.address || !daoData) {
      return;
    }
    if (!apiClients) return;

    try {
      setHasClicked(true);
      setCreatingGrant(true);
      const { validatorApi } = apiClients;
      const {
        data: { ipfsHash },
      } = await validatorApi.validateGrantCreate({
        title: data.title,
        summary: data.summary,
        details: data.details,
        deadline: data.date,
        reward: {
          committed: parseAmount(data.reward),
          asset: data.rewardCurrencyAddress,
        },
        creatorId: accountData.address,
        workspaceId: daoData!.id,
        fields: data.fields,
      });

      const transaction = await grantContract.createGrant(
        daoData!.id,
        ipfsHash,
        config.WorkspaceRegistryAddress,
        config.ApplicationRegistryAddress,
      );
      const transactionData = await transaction.wait();

      setHasClicked(false);
      router.replace({ pathname: '/your_grants', query: { done: 'yes' } });

      showToast({
        link: `https://etherscan.io/tx/${transactionData.transactionHash}`,
      });
    } catch (error) {
      setHasClicked(false);
      // console.log(error);
      toast({
        title: 'Application update not indexed',
        status: 'error',
      });
    }
    // console.log(transactionData);
    // console.log(transactionData.blockNumber);

    // await subgraphClient.waitForBlock(transactionData.blockNumber);

    // router.push('/your_grants');
  };

  if (creatingGrant) {
    return <CreateGrant hasClicked={hasClicked} onSubmit={handleGrantSubmit} />;
  }

  if (daoCreated && daoData) {
    return (
      <DaoCreated
        daoName={daoData.name}
        network={daoData.network}
        onCreateGrantClick={() => setCreatingGrant(true)}
        onVisitGrantsClick={() => router.push('/your_grants')}
      />
    );
  }

  if (loading) {
    return <Loading />;
  }
  return (
    <Container
      maxW="100%"
      display="flex"
      px="70px"
      flexDirection="column"
      alignItems="center"
    >
      <Text mt="46px" variant="heading">
        What should we call your Grants DAO?
      </Text>
      <Text mt={7} maxW="676px" textAlign="center">
        A Grants DAO is a neatly arranged space where you can manage grants,
        review grant applications and fund grants.
      </Text>
      <Form hasClicked={hasClicked} onSubmit={handleFormSubmit} />
    </Container>
  );
}

SignupDao.getLayout = function getLayout(page: ReactElement) {
  return <NavbarLayout renderTabs={false}>{page}</NavbarLayout>;
};

export default SignupDao;
