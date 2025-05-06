const HomeBanner = () => {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-12'>
        <div className='relative h-[800px]'>
          <img
            src='https://esmee.qodeinteractive.com/wp-content/uploads/2021/07/categories-4.jpg'
            alt='New Arrivals'
            className='w-full h-full object-cover rounded-lg'
          />
          <div className='absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-30 text-white'>
            <h3 className='text-3xl font-semibold'>New Arrivals</h3>
            <p className='text-lg'>Stay updated with the latest fashion trends</p>
          </div>
        </div>
        <div className='relative h-[800px]'>
          <img
            src='https://esmee.qodeinteractive.com/wp-content/uploads/2021/07/categories-5.jpg'
            alt='Best Sellers'
            className='w-full h-full object-cover rounded-lg'
          />
          <div className='absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-30 text-white'>
            <h3 className='text-3xl font-semibold'>Best Sellers</h3>
            <p className='text-lg'>Top Picks for B2B Customers</p>
          </div>
        </div>
      </div>
    );
  };
  
  export default HomeBanner;