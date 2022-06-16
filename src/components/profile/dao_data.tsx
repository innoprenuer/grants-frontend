import React, { useEffect, useState } from 'react'
import { Flex, Grid, Heading, Text } from '@chakra-ui/react'
import { getAverageTime } from '../../utils/calculatingUtils'

interface Props {
  disbursed: Array<number>;
  applicants: Array<number>;
  winners: Array<number>;
  grants: any;
  fundTimes: Array<number>;
  grantsFundedTime: Array<number>;
}

function DaoData({ disbursed, applicants, winners, grants, fundTimes, grantsFundedTime }: Props) {

	const [grantToCheck, setGrantoCheck] = useState<any>([])
	const [fundsToCheck, setFundsToCheck] = useState<any>([])

	useEffect(() => {
		console.log(grants)
		console.log(disbursed)

		if(grants && grants.length > 0) {
			grants.grants.forEach((grant: any) => setGrantoCheck((array: any) => [...array, grant.createdAtS])
			)
		}

		console.log(grantToCheck)
	}, [disbursed, grants, fundTimes])

	return (
		<Grid
			gap="1rem"
			gridTemplateColumns="repeat(4, 1fr)"
			w={
				{
					base: '100%',
					sm: '85%',
					lg: '70%',
				}
			}>
			<Flex direction="column">
				<Heading
					color="#122224"
					fontSize="1.2rem"
					lineHeight="1.5rem"
				>
$
					{disbursed.reduce((sum, a) => sum + a, 0).toFixed(0)}
				</Heading>
				<Text
					fontSize="0.875rem"
					lineHeight="24px"
					fontWeight="400"
					color="#AAAAAA"
				>
          Grants Disbursed
				</Text>
			</Flex>

			<Flex direction="column">
				<Heading
					color="#122224"
					fontSize="1.2rem"
					lineHeight="1.5rem">
					{applicants.reduce((sum, a) => sum + a, 0)}
				</Heading>
				<Text
					fontSize="0.875rem"
					lineHeight="24px"
					fontWeight="400"
					color="#AAAAAA"
				>
Applicants
				</Text>
			</Flex>

			<Flex direction="column">
				<Heading
					color="#122224"
					fontSize="1.2rem"
					lineHeight="1.5rem">
					{winners.length}
				</Heading>
				<Text
					fontSize="0.875rem"
					lineHeight="24px"
					fontWeight="400"
					color="#AAAAAA"
				>
Winners
				</Text>
			</Flex>

			<Flex direction="column">
				<Heading
					color="#122224"
					fontSize="1.2rem"
					lineHeight="1.5rem">
					{getAverageTime(fundTimes, grantsFundedTime)}
				</Heading>
				<Text
					fontSize="0.875rem"
					lineHeight="24px"
					fontWeight="400"
					color="#AAAAAA"
				>
Time to release funds
				</Text>
			</Flex>
		</Grid>
	)
}

export default DaoData
