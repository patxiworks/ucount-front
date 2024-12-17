import useSWR from 'swr'

const BACKEND_URL = process.env.NEXT_PUBLIC_UCOUNT_BACKEND_URL

const fetcher = (url) => fetch(url).then((r) => r.json())

function useFetch(item) {
  const { data, error } = useSWR(
    `${BACKEND_URL}/${item}/`,
    //'/data.json',
    fetcher
  )
  if (error) return 'Could not retrieve data'
  if (!data) return 'Loading...'
  
  return data
}

export default useFetch;
