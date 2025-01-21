import {  Container, Heading,  Html, Tailwind, Text } from "@react-email/components";


export const EmailOtp = ({ otp }: { otp?: string }) => {
    if (!otp) {
        otp = "1234";
    }
    return (
        <Html>
            <Tailwind config={{
                theme: {
                    extend: {
                        colors: {
                            color1: '#5c6175',
                            color2: '#7d88b5',
                            color3: '#a3b6d7',
                            color4: '#c5cfe2',
                            color5: '#d9e3ec'
                        }
                    }
                }
            }}>
                <Container className="flex flex-col justify-center items-center h-full font-sans bg-color5 p-8 rounded-lg shadow-md shadow-color1">
                    <Heading>
                        Your One Time OTP
                    </Heading>

                    <Text className="font-medium text-1xl bg-color4 p-4 rounded-lg shadow-md  ">
                        Your OTP is {otp}
                    </Text>
                    <Text className="text-color1 italic">
                        This OTP is valid for 5 minutes.
                    </Text>
                </Container>

            </Tailwind>
        </Html>
    );
}

export default EmailOtp;