import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((r) => r.json())

function useFetch(item) {
  const { data, error } = useSWR(
    `http://127.0.0.1:8000/${item}/`,
    //'/data.json',
    fetcher
  )
  if (error) return 'Could not retrieve data'
  if (!data) return 'Loading...'
  
  return data
}

export default useFetch;
