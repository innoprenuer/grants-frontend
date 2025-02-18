import { useContext, useEffect, useRef, useState } from 'react'
import { ToastId, useToast } from '@chakra-ui/react'
import { ApiClientsContext } from 'pages/_app'
import { SupportedChainId } from 'src/constants/chains'
import useEncryption from 'src/hooks/utils/useEncryption'
import getErrorMessage from 'src/utils/errorUtils'
import { getExplorerUrlForTxHash } from 'src/utils/formattingUtils'
import { uploadToIPFS } from 'src/utils/ipfsUtils'
import {
	getSupportedChainIdFromWorkspace,
} from 'src/utils/validationUtils'
import { useAccount, useNetwork } from 'wagmi'
import ErrorToast from '../components/ui/toasts/errorToast'
import { FeedbackType } from '../components/your_grants/feedbackDrawer'
import {
	useGetInitialReviewedApplicationGrantsQuery,
} from '../generated/graphql'
import { delay } from '../utils/generics'
import useQBContract from './contracts/useQBContract'
import useChainId from './utils/useChainId'

export default function useSubmitReview(
	data: { items?: Array<FeedbackType> },
	setCurrentStep: (step?: number) => void,
	isPrivate: boolean,
	chainId?: SupportedChainId,
	workspaceId?: string,
	grantAddress?: string,
	applicationId?: string,
) {
	const [error, setError] = useState<string>()
	const [loading, setLoading] = useState(false)
	const [incorrectNetwork, setIncorrectNetwork] = useState(false)
	const [transactionData, setTransactionData] = useState<any>()
	const { data: accountData } = useAccount()
	const { data: networkData, switchNetwork } = useNetwork()
	const { encryptMessage } = useEncryption()

	const { validatorApi, workspace, subgraphClients } = useContext(ApiClientsContext)!

	if(!chainId) {
		// eslint-disable-next-line no-param-reassign
		chainId = getSupportedChainIdFromWorkspace(workspace)
	}

	const { client } = subgraphClients[chainId!]

	const { fetchMore: fetchReviews } = useGetInitialReviewedApplicationGrantsQuery({ client })

	const applicationReviewContract = useQBContract('reviews', chainId)

	const toastRef = useRef<ToastId>()
	const toast = useToast()
	const currentChainId = useChainId()

	useEffect(() => {
		if(data) {
			setError(undefined)
			setIncorrectNetwork(false)
		}
	}, [data])

	useEffect(() => {
		if(incorrectNetwork) {
			setIncorrectNetwork(false)
		}

	}, [applicationReviewContract])

	useEffect(() => {
		if(incorrectNetwork) {
			return
		}

		if(error) {
			return
		}

		if(loading) {
			return
		}

		async function validate() {
			setLoading(true)
			setCurrentStep(0)

			try {
				const encryptedReview: { [key in string]: string } = {}
				if(isPrivate) {
					const yourPublicKey = workspace?.members.find(
						(m) => m.actorId.toLowerCase() === accountData?.address?.toLowerCase(),
					)?.publicKey
					const encryptedData = encryptMessage(JSON.stringify(data), yourPublicKey!)
					const encryptedHash = (await uploadToIPFS(encryptedData)).hash
					encryptedReview[accountData!.address!] = encryptedHash

					workspace?.members.filter(
						(m) => (m.accessLevel === 'admin' || m.accessLevel === 'owner') && (m.publicKey && m.publicKey?.length > 0),
					).map((m) => ({ key: m.publicKey, address: m.actorId }))
						.forEach(async({ key, address }) => {
							const encryptedAdminData = encryptMessage(JSON.stringify(data), key!)
							const encryptedAdminHash = (await uploadToIPFS(encryptedAdminData)).hash
							encryptedReview[address] = encryptedAdminHash
						})

				}

				const dataHash = (await uploadToIPFS(JSON.stringify(data))).hash

				const {
					data: { ipfsHash },
				} = await validatorApi.validateReviewSet({
					reviewer: accountData?.address!,
					publicReviewDataHash: isPrivate ? '' : dataHash,
					encryptedReview,
				})


				if(!ipfsHash) {
					throw new Error('Error validating review data')
				}

				setCurrentStep(1)

				const createGrantTransaction = await applicationReviewContract.submitReview(
					accountData?.address!,
					workspaceId || Number(workspace?.id).toString(),
          applicationId!,
          grantAddress!,
          ipfsHash,
				)
				setCurrentStep(2)
				const createGrantTransactionData = await createGrantTransaction.wait()

				setCurrentStep(3)

				const reviewerId = accountData!.address!

				let didIndex = false
				do {
					await delay(2000)
					const result = await fetchReviews({
						variables: {
							reviewerAddress: reviewerId.toLowerCase(),
							reviewerAddressStr: reviewerId,
							applicationsCount: 1,
						},
					})
					const grants = result.data.grantReviewerCounters.map(e => e.grant)
					grants.forEach(grant => {
						if(grant.id === grantAddress) {
							didIndex = true
						}
					})

				} while(!didIndex)

				setTransactionData(createGrantTransactionData)
				setLoading(false)
				setCurrentStep(5)
			} catch(e) {
				setCurrentStep(undefined)
				const message = getErrorMessage(e)
				setError(message)
				setLoading(false)
				toastRef.current = toast({
					position: 'top',
					render: () => ErrorToast({
						content: message,
						close: () => {
							if(toastRef.current) {
								toast.close(toastRef.current)
							}
						},
					}),
				})
			}
		}

		try {
			if(!data) {
				return
			}

			if(!grantAddress) {
				return
			}

			if(!applicationId) {
				return
			}

			if(transactionData) {
				return
			}

			if(!accountData || !accountData.address) {
				throw new Error('not connected to wallet')
			}

			if(!workspace) {
				throw new Error('not connected to workspace')
			}

			if(!currentChainId) {
				if(switchNetwork && chainId) {
					switchNetwork(chainId)
				}

				setIncorrectNetwork(true)
				setLoading(false)
				return
			}

			if(chainId !== currentChainId) {
				if(switchNetwork && chainId) {
					switchNetwork(chainId)
				}

				setIncorrectNetwork(true)
				setLoading(false)
				return
			}

			if(!validatorApi) {
				throw new Error('validatorApi or workspaceId is not defined')
			}

			if(
				!applicationReviewContract
        || applicationReviewContract.address
        === '0x0000000000000000000000000000000000000000'
        || !applicationReviewContract.signer
        || !applicationReviewContract.provider
			) {
				return
			}

			validate()
		} catch(e) {
			const message = getErrorMessage(e)
			setError(message)
			setLoading(false)
			toastRef.current = toast({
				position: 'top',
				render: () => ErrorToast({
					content: message,
					close: () => {
						if(toastRef.current) {
							toast.close(toastRef.current)
						}
					},
				}),
			})
		}

	}, [
		error,
		loading,
		toast,
		transactionData,
		applicationReviewContract,
		validatorApi,
		workspace,
		accountData,
		networkData,
		currentChainId,
		chainId,
		workspaceId,
		data,
		grantAddress,
		applicationId,
		incorrectNetwork,
	])

	return [
		transactionData,
		getExplorerUrlForTxHash(chainId || getSupportedChainIdFromWorkspace(workspace), transactionData?.transactionHash),
		loading,
		error,
	]
}
