import Image from 'next/image'

export default function Logo(props) {
  return (
    <div className="logo">
      <div className="logo-wrapper">
		    <Image src={props.logo} width="40" height="40" alt="uCount"/>
        <h3 className="logo-text-wrapper">
          <span className="logo-text-1">u</span>
          <span className="logo-text-2">Count</span>
        </h3>
	    </div>
    </div>
  );
}
